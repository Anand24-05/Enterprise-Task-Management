const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socket');

// Get all company members' tasks grouped by user.
// A task appears in a member's row if they are the owner OR a collaborator.
exports.getCompanyCollaboration = async (req, res) => {
  try {
    const companyId = req.user.role === 'company' ? req.user.userId : req.user.companyId;
    if (!companyId) {
      return res.status(403).json({ error: 'You are not associated with a company.' });
    }

    const members = await User.find({ companyId, role: 'user' }).select('_id userId email');
    const memberIds = members.map(m => m._id);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Fetch every task that belongs to any company member (as owner OR collaborator)
    const tasks = await Task.find({
      $or: [
        { owner: { $in: memberIds } },
        { collaborators: { $in: memberIds } }
      ],
      taskDate: { $gte: startOfMonth, $lte: endOfMonth }
    })
      .populate('owner', 'userId email')
      .populate('collaborators', 'userId email')
      .populate('assignedBy', 'userId companyName')
      .sort({ taskDate: 1 });

    // Group: each member gets tasks where they are owner OR collaborator
    const grouped = members.map(member => {
      const memberId = member._id.toString();
      const memberTasks = tasks.filter(t => {
        const isOwner = t.owner._id.toString() === memberId;
        const isCollaborator = t.collaborators.some(c => c._id.toString() === memberId);
        return isOwner || isCollaborator;
      });
      return { user: member, tasks: memberTasks };
    });

    res.json({ collaboration: grouped, companyId });
  } catch (error) {
    console.error('getCompanyCollaboration error:', error);
    res.status(500).json({ error: 'Error fetching collaboration data.' });
  }
};

// Create collaborative task
exports.createCollaborativeTask = async (req, res) => {
  try {
    const companyId = req.user.role === 'company' ? req.user.userId : req.user.companyId;
    if (!companyId) return res.status(403).json({ error: 'No company association.' });

    const { title, description, priority, dueDate, taskDate, collaboratorIds } = req.body;

    const task = await Task.create({
      title, description, priority, dueDate,
      taskDate: taskDate || new Date(),
      owner: req.user._id,
      companyId,
      isCollaborative: true,
      collaborators: collaboratorIds || [],
      assignedBy: req.user._id
    });

    if (collaboratorIds && collaboratorIds.length > 0) {
      const notifications = collaboratorIds.map(uid => ({
        recipient: uid,
        sender: req.user._id,
        type: 'collaborator_added',
        message: `${req.user.userId} added you as collaborator on "${title}"`,
        taskId: task._id
      }));
      const created = await Notification.insertMany(notifications);
      const io = getIO();
      created.forEach(n => io.to(n.recipient.toString()).emit('notification', n));
    }

    const populated = await Task.findById(task._id)
      .populate('owner', 'userId email')
      .populate('collaborators', 'userId email')
      .populate('assignedBy', 'userId companyName');

    res.status(201).json({ task: populated });
  } catch (error) {
    console.error('createCollaborativeTask error:', error);
    res.status(500).json({ error: 'Error creating collaborative task.' });
  }
};

// Update a collaborative task.
// Allowed by: the task owner OR any collaborator on the task.
exports.updateCollaborativeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const userId = req.user._id.toString();
    const isOwner = task.owner.toString() === userId;
    const isCollaborator = task.collaborators.map(c => c.toString()).includes(userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'You are not the owner or a collaborator of this task.' });
    }

    const { title, description, priority, dueDate, taskDate, isDone, collaboratorIds } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (taskDate !== undefined) updates.taskDate = taskDate;
    if (isDone !== undefined) {
      updates.isDone = isDone;
      updates.status = isDone ? 'completed' : 'pending';
    }

    // Only the owner may change the collaborator list
    if (collaboratorIds !== undefined && isOwner) {
      // Notify newly added collaborators
      const previous = task.collaborators.map(c => c.toString());
      const added = collaboratorIds.filter(id => !previous.includes(id));
      if (added.length > 0) {
        const notifications = added.map(uid => ({
          recipient: uid,
          sender: req.user._id,
          type: 'collaborator_added',
          message: `${req.user.userId} added you as collaborator on "${task.title}"`,
          taskId: task._id
        }));
        const created = await Notification.insertMany(notifications);
        const io = getIO();
        created.forEach(n => io.to(n.recipient.toString()).emit('notification', n));
      }
      updates.collaborators = collaboratorIds;
      updates.isCollaborative = collaboratorIds.length > 0;
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('owner', 'userId email')
      .populate('collaborators', 'userId email')
      .populate('assignedBy', 'userId companyName');

    res.json({ task: updated, message: 'Task updated.' });
  } catch (error) {
    console.error('updateCollaborativeTask error:', error);
    res.status(500).json({ error: 'Error updating collaborative task.' });
  }
};

// Get company members
exports.getCompanyMembers = async (req, res) => {
  try {
    const companyId = req.user.role === 'company' ? req.user.userId : req.user.companyId;
    if (!companyId) return res.status(403).json({ error: 'No company association.' });

    const members = await User.find({ companyId, role: 'user' }).select('_id userId email profilePicture');
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching members.' });
  }
};

exports.deleteCollaborationTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await Task.findById(id)

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      })
    }

    // Only owner can delete
    if (task.owner.toString() !== userId) {
      return res.status(403).json({
        error: 'Only owner can delete task'
      })
    }

    await Task.findByIdAndDelete(id)

    return res.json({
      success: true,
      message: 'Task deleted'
    })
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to delete task'
    })
  }
}

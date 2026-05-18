const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socket');

// Get tasks by date
exports.getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      owner: req.user._id,
      taskDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate('assignedBy', 'userId companyName').sort({ createdAt: 1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks.' });
  }
};

// Get tasks by month
exports.getTasksByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const tasks = await Task.find({
      owner: req.user._id,
      taskDate: { $gte: startOfMonth, $lte: endOfMonth }
    }).select('title taskDate isDone status priority');

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching monthly tasks.' });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, taskDate, tags, isCollaborative, collaborators } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      taskDate: taskDate || new Date(),
      tags,
      isCollaborative,
      collaborators,
      companyId: req.user.companyId,
      owner: req.user._id
    });

    // Notify collaborators
    if (collaborators && collaborators.length > 0) {
      const notifications = collaborators.map(userId => ({
        recipient: userId,
        sender: req.user._id,
        type: 'collaborator_added',
        message: `${req.user.userId} added you as a collaborator on task "${title}"`,
        taskId: task._id
      }));
      const created = await Notification.insertMany(notifications);
      const io = getIO();
      created.forEach(n => io.to(n.recipient.toString()).emit('notification', n));
    }

    res.status(201).json({ task, message: 'Task created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating task.' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const isOwner = task.owner.toString() === req.user._id.toString();
    const isCompanyAdmin = req.user.role === 'company' && task.companyId === req.user.companyId;

    if (!isOwner && !isCompanyAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this task.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    res.json({ task: updatedTask, message: 'Task updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating task.' });
  }
};

// Toggle done
exports.toggleDone = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    task.isDone = !task.isDone;
    task.status = task.isDone ? 'completed' : 'pending';
    await task.save();

    res.json({ task, message: `Task marked as ${task.isDone ? 'done' : 'undone'}.` });
  } catch (error) {
    res.status(500).json({ error: 'Error toggling task.' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const isOwner = task.owner.toString() === req.user._id.toString();
    const isCompanyAdmin = req.user.role === 'company' && task.companyId === req.user.companyId;

    if (!isOwner && !isCompanyAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task.' });
  }
};

// Company: assign task to user
exports.assignTask = async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can assign tasks.' });
    }

    const { userId, title, description, priority, dueDate, taskDate } = req.body;
    const User = require('../models/User');
    const targetUser = await User.findOne({ userId, companyId: req.user.userId });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found under your company.' });
    }

    const task = await Task.create({
      title, description, priority, dueDate,
      taskDate: taskDate || new Date(),
      owner: targetUser._id,
      assignedBy: req.user._id,
      companyId: req.user.userId
    });

    const notification = await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'task_assigned',
      message: `${req.user.companyName || req.user.userId} assigned you a task: "${title}"`,
      taskId: task._id
    });

    const io = getIO();
    io.to(targetUser._id.toString()).emit('notification', notification);

    res.status(201).json({ task, message: 'Task assigned successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error assigning task.' });
  }
};

// Search tasks
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    const tasks = await Task.find({
      owner: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Error searching tasks.' });
  }
};

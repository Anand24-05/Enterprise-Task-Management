const User = require('../models/User');
const Task = require('../models/Task');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken -emailVerificationToken');
    const taskCount = await Task.countDocuments({ owner: req.user._id });
    const completedCount = await Task.countDocuments({ owner: req.user._id, isDone: true });
    res.json({ user, stats: { total: taskCount, completed: completedCount, pending: taskCount - completedCount } });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['companyName', 'profilePicture', 'backgroundTheme'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password -refreshToken');
    res.json({ user, message: 'Profile updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password.' });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ error: 'Email already in use.' });

    const user = await User.findByIdAndUpdate(req.user._id, { email: newEmail, isEmailVerified: false }, { new: true });
    res.json({ message: 'Email updated. Please verify your new email.', user });
  } catch (error) {
    res.status(500).json({ error: 'Error changing email.' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date()

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    // Own + collaborative tasks filter
    const taskFilter = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.userId': req.user._id }
      ]
    }

    const [total, completed, thisWeek, overdue] =
      await Promise.all([
        Task.countDocuments(taskFilter),

        Task.countDocuments({
          ...taskFilter,
          isDone: true
        }),

        Task.countDocuments({
          ...taskFilter,
          taskDate: { $gte: startOfWeek }
        }),

        Task.countDocuments({
          ...taskFilter,
          dueDate: { $lt: today },
          isDone: false
        })
      ])

    const recentTasks = await Task.find(taskFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'userId email')
      .populate('collaborators.userId', 'userId email')
      .select(
        'title status priority isDone taskDate collaborators owner'
      )

    res.json({
      stats: {
        total,
        completed,
        pending: total - completed,
        thisWeek,
        overdue
      },
      recentTasks
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error fetching dashboard stats.'
    })
  }
}
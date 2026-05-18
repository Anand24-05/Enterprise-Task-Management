const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/search', taskController.searchTasks);
router.get('/date/:date', taskController.getTasksByDate);
router.get('/month/:year/:month', taskController.getTasksByMonth);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/toggle-done', taskController.toggleDone);
router.delete('/:id', taskController.deleteTask);
router.post('/assign', authorize('company'), taskController.assignTask);

module.exports = router;

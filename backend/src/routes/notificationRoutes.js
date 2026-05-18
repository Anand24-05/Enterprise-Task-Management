const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAsRead);
router.patch('/:id/read', notificationController.markOneAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', collaborationController.getCompanyCollaboration);
router.get('/members', collaborationController.getCompanyMembers);
router.post('/task', collaborationController.createCollaborativeTask);
router.put('/task/:id', collaborationController.updateCollaborativeTask);
router.delete(
  '/task/:id',
  collaborationController.deleteCollaborationTask
)

module.exports = router;

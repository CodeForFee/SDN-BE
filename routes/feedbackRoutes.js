const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

router.get('/', protect, allowRoles('DealerManager'), feedbackController.getFeedbacks);
router.post('/', protect, allowRoles('DealerStaff'), feedbackController.createFeedback);
router.put('/:id/status', protect, allowRoles('DealerManager'), feedbackController.updateFeedbackStatus);

module.exports = router;



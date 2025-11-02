const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/authMiddleware');

// DealerStaff và DealerManager có thể xem feedbacks của đại lý mình
router.get('/', protect, allowRoles('DealerStaff', 'DealerManager', 'Admin'), feedbackController.getFeedbacks);
// DealerStaff có thể tạo feedback
router.post('/', protect, allowRoles('DealerStaff', 'Admin'), feedbackController.createFeedback);
// Chỉ DealerManager và Admin có thể cập nhật trạng thái feedback
router.put('/:id/status', protect, allowRoles('DealerManager', 'Admin'), feedbackController.updateFeedbackStatus);
// DealerStaff có thể forward feedback lên Dealer Manager
router.put('/:id/forward', protect, allowRoles('DealerStaff'), feedbackController.forwardFeedback);

module.exports = router;



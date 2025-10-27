const express = require('express');
const { login, register, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roles');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
// Only Admin and Dealer Manager can register new users (Dealer Manager can only create DealerStaff)
router.post('/register', protect, allowRoles('Admin', 'DealerManager'), register);
router.get('/me', protect, me);

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// Token refresh (placeholder)
router.post('/refresh', (req, res) => {
  res.json({ success: true, message: 'Token refresh - implement if needed' });
});

module.exports = router;


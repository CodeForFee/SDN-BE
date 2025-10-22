const express = require('express');
const { login, register, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', protect, register);
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


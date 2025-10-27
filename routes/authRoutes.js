const express = require('express');
const { login, register, me, logout, refreshToken } = require('../controllers/authController');
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
router.post('/logout', protect, logout);

// Token refresh
router.post('/refresh', refreshToken);

module.exports = router;


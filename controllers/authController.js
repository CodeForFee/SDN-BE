const User = require("../models/User");
const { ROLES } = require("../models/User");
const { generateToken, generateRefreshToken, verifyToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

// In-memory token blacklist (use Redis or database in production)
const tokenBlacklist = new Set();

// @desc Register user (Admin or DealerManager)
exports.register = async (req, res) => {
  try {
    const { email, password, role, profile, dealer } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Check if user is Admin or DealerManager
    if (!req.user || (req.user.role !== "Admin" && req.user.role !== "DealerManager")) {
      return res
        .status(403)
        .json({ message: "Only Admin and DealerManager can register new users" });
    }

    // DealerManager can only create DealerStaff
    if (req.user.role === "DealerManager" && role !== "DealerStaff") {
      return res.status(403).json({ 
        message: "DealerManager can only create DealerStaff accounts" 
      });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // DealerManager must create users for their own dealer
    if (req.user.role === "DealerManager") {
      if (!dealer || dealer.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ 
          message: "DealerManager can only create staff for their own dealer" 
        });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, passwordHash, role, profile, dealer });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        dealer: user.dealer,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        dealer: user.dealer,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @desc Get current user profile
exports.me = async (req, res) => {
  res.json(req.user);
};

// @desc Logout
exports.logout = async (req, res) => {
  try {
    // Xóa cookie chứa token và refresh token
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
};


// @desc Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(refreshToken)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if it's a refresh token (optional check for token type)
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    // Add old refresh token to blacklist
    tokenBlacklist.add(refreshToken);

    res.json({
      message: "Token refreshed successfully",
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        dealer: user.dealer,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

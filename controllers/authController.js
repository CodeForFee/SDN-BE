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
    
    // Status is controlled by backend only - ignore if sent from frontend
    // New users are always created with status 'active'
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

    // Handle dealer field: convert empty string to undefined/null
    // Mongoose cannot cast empty string "" to ObjectId
    let dealerId = dealer;
    if (dealerId === "" || dealerId === null || dealerId === undefined) {
      dealerId = undefined;
    }

    // Roles that don't require dealer
    const rolesWithoutDealer = ["EVMStaff", "Admin"];
    
    // DealerManager must create users for their own dealer
    if (req.user.role === "DealerManager") {
      if (!dealerId || dealerId.toString() !== req.user.dealer.toString()) {
        return res.status(403).json({ 
          message: "DealerManager can only create staff for their own dealer" 
        });
      }
      // DealerManager creates DealerStaff, so dealer is required and already validated above
    } else if (req.user.role === "Admin") {
      // Admin can create any role
      // If role doesn't need dealer, ignore dealer value
      if (rolesWithoutDealer.includes(role)) {
        dealerId = undefined;
      }
      // If role needs dealer (DealerStaff, DealerManager), dealerId should be provided
      // But if empty string was sent, dealerId is already set to undefined
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    // Prepare user data - only include dealer if it has a valid value
    const userData = {
      email, 
      passwordHash, 
      role, 
      profile,
      status: 'active' // Explicitly set status - users are active by default
    };

    // Only add dealer if it's a valid value
    if (dealerId) {
      userData.dealer = dealerId;
    }

    // Create user with default status 'active' (status is controlled by backend only)
    const user = await User.create(userData);

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

// @desc Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const userId = req.user._id;

    if (!profile) {
      return res.status(400).json({ message: "Profile information is required" });
    }

    const updateData = {};
    if (profile.name !== undefined) {
      updateData["profile.name"] = profile.name;
    }
    if (profile.phone !== undefined) {
      updateData["profile.phone"] = profile.phone;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid profile fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { passwordHash });

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

const User = require("../models/User");
const { ROLES } = require("../models/User");
const { generateToken } = require("../utils/jwt");

// @desc Register user (only Admin)
exports.register = async (req, res) => {
  try {
    const { email, password, role, profile, dealer } = req.body;

    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only Admin can register new users" });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ email, password, role, profile, dealer });

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

    res.json({
      message: "Login successful",
      token,
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

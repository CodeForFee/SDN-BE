const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role, type: "refresh" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
};

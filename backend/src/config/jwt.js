const jwt = require('jsonwebtoken');

// Tạo token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
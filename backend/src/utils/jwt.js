const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET || 'secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (userId, rememberMe = false) => {
  return jwt.sign(
    { userId, rememberMe },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};

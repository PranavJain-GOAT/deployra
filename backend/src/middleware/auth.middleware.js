const { verifyAccessToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check for token in cookies first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      // Fallback to Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have access.' });
    }
    next();
  };
};

const adminOnly = authorize('ADMIN');

const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check for token in cookies first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else {
      // Fallback to Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore error for optional authentication, proceed as anonymous
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  adminOnly
};


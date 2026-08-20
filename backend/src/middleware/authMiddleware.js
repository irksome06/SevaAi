const User = require('../models/User');
const { verifyToken } = require('../utils/tokenUtils');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.',
        });
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
        error: error.name,
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization header with Bearer token is required.',
    });
  }
};

module.exports = {
  protect,
};

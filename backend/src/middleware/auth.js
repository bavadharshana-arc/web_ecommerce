const jwt = require('jsonwebtoken');
const prisma = require('../database/prisma');
const config = require('../config');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Authentication middleware: Verifies JWT token and attaches validated user from database
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    // Always fetch user from database to ensure fresh role and active status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * RBAC middleware: Restricts route access to users with ADMIN role
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }

  if (req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied. Administrator privileges required.', 403);
  }

  next();
};

/**
 * Optional authentication middleware: Attaches user if token is present, but doesn't block if absent
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
        },
      });
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    // Silently continue for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  optionalAuthenticate,
};

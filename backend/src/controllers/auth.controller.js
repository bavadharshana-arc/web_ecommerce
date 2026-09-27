const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../database/prisma');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Generate signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Helper to sanitize user object removing password hash
 */
const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

/**
 * @desc    Register a new customer account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return errorResponse(res, 'An account with this email already exists.', 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user and initialize cart in a single transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        role: 'USER',
        isActive: true,
      },
    });

    await tx.cart.create({
      data: {
        userId: user.id,
      },
    });

    return user;
  });

  const token = generateToken(newUser.id, newUser.role);

  return successResponse(
    res,
    {
      user: sanitizeUser(newUser),
      token,
    },
    'Account registered successfully',
    201
  );
});

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return errorResponse(res, 'Invalid email or password credentials.', 401);
  }

  if (!user.isActive) {
    return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return errorResponse(res, 'Invalid email or password credentials.', 401);
  }

  const token = generateToken(user.id, user.role);

  return successResponse(
    res,
    {
      user: sanitizeUser(user),
      token,
    },
    'Login successful'
  );
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, { user: req.user }, 'User profile retrieved successfully');
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: name !== undefined ? name : undefined,
      phone: phone !== undefined ? phone : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return successResponse(res, { user: updatedUser }, 'Profile updated successfully');
});

/**
 * @desc    Logout user (stateless JWT client cleanup confirmation)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
};

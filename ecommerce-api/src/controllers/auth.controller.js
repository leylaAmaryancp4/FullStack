const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');
const {
  BadRequestError,
  UnauthorizedError
} = require('../utils/errors');

const register = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await authService.registerUser(email, password);

  res.status(201).json({
    message: 'User registered successfully',
    user
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  const user = await authService.validateCredentials(email, password);

  req.session.userId = user.id;

  res.status(200).json({
    message: 'Login successful',
    user
  });
});



const getMe = catchAsync(async (req, res) => {
  if (!req.session.userId) {
    throw new UnauthorizedError('Not authenticated');
  }

  const user = await authService.getUserById(req.session.userId);

  res.status(200).json({
    user
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!Number.isInteger(userId)) {
    throw new BadRequestError('Invalid user ID');
  }

  if (!['customer', 'admin'].includes(role)) {
    throw new BadRequestError('Role must be customer or admin');
  }

  const user = await authService.updateUserRole(userId, role);

  res.status(200).json({
    message: 'User role updated successfully',
    user
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateUserRole
};
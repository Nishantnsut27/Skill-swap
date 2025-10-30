import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, userId } = req.body;
  
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const existingUserId = await User.findOne({ userId });
  if (existingUserId) {
    return res.status(409).json({ message: 'User ID already taken' });
  }

  const user = await User.create(req.body);
  const token = generateToken({ id: user._id });
  const payload = await User.findById(user._id).select('-password');
  res.status(201).json({ user: payload, token });
});

export const checkUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const existing = await User.findOne({ userId: userId.toLowerCase() });
  res.json({ available: !existing });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({ id: user._id });
  const payload = await User.findById(user._id).select('-password');
  res.json({ user: payload, token });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

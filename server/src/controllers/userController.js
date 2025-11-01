import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { calculateBadges } from '../services/badgeService.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const updates = req.body;
  if (updates.password) delete updates.password;
  
  if (updates.userId) {
    const existingUser = await User.findOne({ 
      userId: updates.userId.toLowerCase(),
      _id: { $ne: req.user._id }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'User ID already taken' });
    }
  }
  
  if (typeof updates.completedSessions === 'number') {
    updates.badges = calculateBadges(updates.completedSessions);
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json(user);
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Search query required' });
  }

  const users = await User.find({
    $or: [
      { userId: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: req.user._id }
  })
  .select('name email userId skills interests bio avatar')
  .limit(20);

  const FriendRequest = (await import('../models/FriendRequest.js')).FriendRequest;
  const currentUser = await User.findById(req.user._id);
  
  const results = await Promise.all(users.map(async (user) => {
    const isFriend = currentUser.friends.some(
      friendId => friendId.toString() === user._id.toString()
    );

    const sentRequest = await FriendRequest.findOne({
      from: req.user._id,
      to: user._id,
      status: 'pending'
    });

    const receivedRequest = await FriendRequest.findOne({
      from: user._id,
      to: req.user._id,
      status: 'pending'
    });

    return {
      user: user.toObject(),
      isFriend,
      requestStatus: sentRequest ? 'pending' : receivedRequest ? 'pending' : null,
      requestDirection: sentRequest ? 'sent' : receivedRequest ? 'received' : null
    };
  }));

  res.json(results);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('upvotes.user', 'name email');
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  const currentUser = await User.findById(req.user._id);
  const isFriend = currentUser.friends.some(
    friendId => friendId.toString() === req.params.id
  );
  const hasUpvoted = user.upvotes.some(
    upvote => upvote.user._id.toString() === req.user._id.toString()
  );

  res.json({
    ...user.toObject(),
    isFriend,
    hasUpvoted,
    upvoteCount: user.upvotes.length,
  });
});

export const upvoteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { comment } = req.body;

  if (userId === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot upvote yourself' });
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const currentUser = await User.findById(req.user._id);
  const isFriend = currentUser.friends.some(
    friendId => friendId.toString() === userId
  );

  if (!isFriend) {
    return res.status(403).json({ message: 'You can only upvote your friends' });
  }

  const hasUpvoted = targetUser.upvotes.some(
    upvote => upvote.user.toString() === req.user._id.toString()
  );

  if (hasUpvoted) {
    return res.status(400).json({ message: 'You have already upvoted this user' });
  }

  targetUser.upvotes.push({
    user: req.user._id,
    comment: comment || '',
    createdAt: new Date(),
  });

  await targetUser.save();

  const updatedUser = await User.findById(userId)
    .select('-password')
    .populate('upvotes.user', 'name email');

  res.json({
    message: 'Upvote added successfully',
    upvoteCount: updatedUser.upvotes.length,
    upvotes: updatedUser.upvotes,
  });
});

export const removeUpvote = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  targetUser.upvotes = targetUser.upvotes.filter(
    upvote => upvote.user.toString() !== req.user._id.toString()
  );

  await targetUser.save();

  res.json({
    message: 'Upvote removed successfully',
    upvoteCount: targetUser.upvotes.length,
  });
});

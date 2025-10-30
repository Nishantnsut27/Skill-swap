import { User } from '../models/User.js';
import { FriendRequest } from '../models/FriendRequest.js';

let io;

export const setIO = (ioInstance) => {
  io = ioInstance;
};

export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot add yourself' });
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.friends.includes(user._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: user._id },
        { from: user._id, to: req.user._id }
      ]
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        country: user.country,
        language: user.language
      },
      requestStatus: existingRequest ? existingRequest.status : null,
      requestDirection: existingRequest ? (existingRequest.from.toString() === req.user._id.toString() ? 'sent' : 'received') : null
    });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendRequest = await FriendRequest.create({
      from: req.user._id,
      to: userId,
      message: message || '',
      status: 'pending'
    });

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('from', 'name email bio skills interests country language')
      .populate('to', 'name email bio skills interests country language');

    if (io) {
      console.log(`Emitting friend request to user ${userId}`);
      io.to(userId).emit('friend:request:received', populatedRequest);
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const { type } = req.query;

    let query = {};
    if (type === 'received') {
      query = { to: req.user._id, status: 'pending' };
    } else if (type === 'sent') {
      query = { from: req.user._id, status: 'pending' };
    } else {
      query = {
        $or: [
          { to: req.user._id, status: 'pending' },
          { from: req.user._id, status: 'pending' }
        ]
      };
    }

    const requests = await FriendRequest.find(query)
      .populate('from', 'name email bio skills interests country language')
      .populate('to', 'name email bio skills interests country language')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    if (action === 'accept') {
      friendRequest.status = 'accepted';
      await friendRequest.save();

      await User.findByIdAndUpdate(friendRequest.from, {
        $addToSet: { friends: friendRequest.to }
      });

      await User.findByIdAndUpdate(friendRequest.to, {
        $addToSet: { friends: friendRequest.from }
      });

      const populatedRequest = await FriendRequest.findById(friendRequest._id)
        .populate('from', 'name email bio skills interests country language')
        .populate('to', 'name email bio skills interests country language');

      if (io) {
        io.to(friendRequest.from.toString()).emit('friend:request:accepted', populatedRequest);
      }

      res.json({ message: 'Friend request accepted', request: populatedRequest });
    } else {
      friendRequest.status = 'rejected';
      await friendRequest.save();
      
      if (io) {
        io.to(friendRequest.from.toString()).emit('friend:request:rejected', { requestId });
      }
      
      res.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'name email bio skills interests country language'
    );

    res.json(user.friends || []);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user._id }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

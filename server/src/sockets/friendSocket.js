import { FriendRequest } from '../models/FriendRequest.js';
import { User } from '../models/User.js';

export default function registerFriendSocket(io, socket) {
  const userId = socket.user._id.toString();

  socket.on('friend:request:send', async ({ targetUserId, message }) => {
    try {
      const friendRequest = await FriendRequest.create({
        from: userId,
        to: targetUserId,
        message: message || '',
        status: 'pending'
      });

      const populatedRequest = await FriendRequest.findById(friendRequest._id)
        .populate('from', 'name email bio skills interests country language')
        .populate('to', 'name email bio skills interests country language');

      io.to(targetUserId).emit('friend:request:received', populatedRequest);
      socket.emit('friend:request:sent', populatedRequest);
    } catch (error) {
      socket.emit('friend:request:error', { message: error.message });
    }
  });

  socket.on('friend:request:accept', async ({ requestId }) => {
    try {
      const friendRequest = await FriendRequest.findById(requestId);
      
      if (!friendRequest || friendRequest.to.toString() !== userId) {
        return socket.emit('friend:request:error', { message: 'Invalid request' });
      }

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

      io.to(friendRequest.from.toString()).emit('friend:request:accepted', populatedRequest);
      socket.emit('friend:request:accepted', populatedRequest);
    } catch (error) {
      socket.emit('friend:request:error', { message: error.message });
    }
  });

  socket.on('friend:request:reject', async ({ requestId }) => {
    try {
      const friendRequest = await FriendRequest.findById(requestId);
      
      if (!friendRequest || friendRequest.to.toString() !== userId) {
        return socket.emit('friend:request:error', { message: 'Invalid request' });
      }

      friendRequest.status = 'rejected';
      await friendRequest.save();

      io.to(friendRequest.from.toString()).emit('friend:request:rejected', { requestId });
      socket.emit('friend:request:rejected', { requestId });
    } catch (error) {
      socket.emit('friend:request:error', { message: error.message });
    }
  });
}

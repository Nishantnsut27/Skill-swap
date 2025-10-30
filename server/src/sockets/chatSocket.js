import { Match } from '../models/Match.js';
import { Message } from '../models/Message.js';

export const onlineUsers = new Map();

const isParticipant = (room, userId) =>
  room.participants.some((participant) => participant.toString() === userId.toString());

const serializeMessage = (message) => ({
  _id: message._id,
  room: message.room,
  sender: message.sender._id || message.sender,
  senderName: message.sender.name || message.senderName,
  content: message.content,
  createdAt: message.createdAt,
});

const emitRoomsForUser = async (io, userId) => {
  const rooms = await Match.find({ participants: userId })
    .populate('participants', 'name email skills interests')
    .sort({ updatedAt: -1 });
  io.to(userId).emit('chat:rooms', rooms);
};

export default function registerChatSocket(io, socket) {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);
  socket.join(userId);
  emitRoomsForUser(io, userId);

  socket.on('chat:join', async ({ roomId }) => {
    if (!roomId) return;
    const room = await Match.findById(roomId);
    if (!room || !isParticipant(room, userId)) return;
    socket.join(roomId);
    const history = await Message.find({ room: roomId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    socket.emit('chat:history', history.map(serializeMessage));
  });

  socket.on('chat:leave', ({ roomId }) => {
    if (roomId) socket.leave(roomId);
  });

  socket.on('chat:typing', ({ roomId, typing }) => {
    if (!roomId) return;
    socket.to(roomId).emit('chat:typing', {
      userId,
      userName: socket.user.name,
      typing: Boolean(typing),
    });
  });

  socket.on('chat:message', async ({ roomId, content }) => {
    if (!roomId || !content) return;
    const room = await Match.findById(roomId);
    if (!room || !isParticipant(room, userId)) return;
    const message = await Message.create({ room: roomId, sender: userId, content });
    const payload = {
      _id: message._id,
      room: roomId,
      sender: userId,
      senderName: socket.user.name,
      content,
      createdAt: message.createdAt,
    };
    await Match.findByIdAndUpdate(roomId, {
      lastMessage: {
        content,
        sender: userId,
        sentAt: new Date(),
      },
    });
    
    socket.emit('chat:message', payload);
    socket.to(roomId).emit('chat:message', payload);
    
    const participants = room.participants.map((participant) => participant.toString());
    await Promise.all(participants.map((participantId) => emitRoomsForUser(io, participantId)));
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
  });
}

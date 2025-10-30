import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Match } from '../models/Match.js';
import { Message } from '../models/Message.js';
import { CallLog } from '../models/CallLog.js';

const ensureParticipant = (room, userId) => {
  const allowed = room.participants.some((participant) => participant.toString() === userId.toString());
  if (!allowed) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
};

export const listRooms = asyncHandler(async (req, res) => {
  const rooms = await Match.find({ participants: req.user._id })
    .populate('participants', 'name email skills interests')
    .sort({ updatedAt: -1 });
  res.json(rooms);
});

export const createRoom = asyncHandler(async (req, res) => {
  const { targetId } = req.body;
  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: 'Invalid target user' });
  }
  if (req.user._id.toString() === targetId.toString()) {
    return res.status(400).json({ message: 'Cannot create room with yourself' });
  }
  const normalized = [req.user._id.toString(), targetId.toString()].sort();
  const participantSet = normalized.map((value) => new mongoose.Types.ObjectId(value));
  const existing = await Match.findOne({
    participants: { $all: participantSet },
    $expr: { $eq: [{ $size: '$participants' }, 2] },
  }).populate('participants', 'name email skills interests');
  if (existing) {
    return res.json(existing);
  }
  const room = await Match.create({ participants: participantSet });
  const hydrated = await Match.findById(room._id).populate('participants', 'name email skills interests');
  res.status(201).json(hydrated);
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const room = await Match.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  ensureParticipant(room, req.user._id);
  
  const [messages, callLogs] = await Promise.all([
    Message.find({ room: room._id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 }),
    CallLog.find({ room: room._id })
      .populate('caller', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 })
  ]);

  const messageItems = messages.map((message) => ({
    _id: message._id,
    type: 'message',
    room: message.room,
    sender: message.sender._id,
    senderName: message.sender.name,
    content: message.content,
    createdAt: message.createdAt,
  }));

  const callLogItems = callLogs.map((log) => ({
    _id: log._id,
    type: 'call',
    room: log.room,
    caller: log.caller._id,
    callerName: log.caller.name,
    receiver: log.receiver._id,
    receiverName: log.receiver.name,
    callType: log.type,
    duration: log.duration,
    status: log.status,
    createdAt: log.createdAt,
  }));

  const combined = [...messageItems, ...callLogItems].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  res.json(combined);
});

export const createCallLog = asyncHandler(async (req, res) => {
  const { targetId, duration, type = 'video' } = req.body;
  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: 'Invalid target user' });
  }
  const normalized = [req.user._id.toString(), targetId.toString()].sort();
  const participantSet = normalized.map((value) => new mongoose.Types.ObjectId(value));
  const room = await Match.findOne({
    participants: { $all: participantSet },
    $expr: { $eq: [{ $size: '$participants' }, 2] },
  });
  if (!room) {
    return res.status(404).json({ message: 'Chat room not found' });
  }
  const callLog = await CallLog.create({
    room: room._id,
    caller: req.user._id,
    receiver: targetId,
    type,
    duration: duration || 0,
    status: duration > 0 ? 'completed' : 'missed',
  });
  res.status(201).json(callLog);
});

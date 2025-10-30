import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['video', 'audio'], default: 'video' },
    duration: { type: Number, default: 0 },
    status: { type: String, enum: ['completed', 'missed', 'rejected'], default: 'completed' },
  },
  { timestamps: true }
);

export const CallLog = mongoose.model('CallLog', callLogSchema);

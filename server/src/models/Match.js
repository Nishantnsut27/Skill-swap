import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
    },
  },
  { timestamps: true },
);

matchSchema.index({ participants: 1 });

matchSchema.pre('save', function normalizeParticipants(next) {
  this.participants = this.participants
    .map((participant) => participant.toString())
    .sort()
    .map((value) => new mongoose.Types.ObjectId(value));
  next();
});

export const Match = mongoose.model('Match', matchSchema);

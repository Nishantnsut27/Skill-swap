import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    threshold: { type: Number, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Badge = mongoose.model('Badge', badgeSchema);

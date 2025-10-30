import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    interests: [{ type: String }],
    language: { type: String, default: '' },
    country: { type: String, default: '' },
    avatar: { type: String, default: '' },
    completedSessions: { type: Number, default: 0 },
    badges: [{ type: String }],
    matches: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
      },
    ],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvotes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);

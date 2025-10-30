import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error('Missing token');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) throw new Error('User not found');
    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
}

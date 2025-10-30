import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import matchRoutes from './routes/match.js';
import friendRoutes from './routes/friends.js';
import { errorHandler } from './utils/errorHandler.js';
import { setIO } from './controllers/friendController.js';

dotenv.config();

const app = express();

export const initializeIO = (ioInstance) => {
  setIO(ioInstance);
};

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'SkillSwap API', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/friends', friendRoutes);

app.use(errorHandler);

export default app;

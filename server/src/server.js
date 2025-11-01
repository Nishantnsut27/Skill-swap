import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app, { initializeIO } from './app.js';
import { connectDB } from './config/db.js';
import registerChatSocket, { onlineUsers } from './sockets/chatSocket.js';
import registerSignalingSocket from './sockets/signalingSocket.js';
import registerFriendSocket from './sockets/friendSocket.js';
import { socketAuth } from './middlewares/socketAuth.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://skill-swap-alpha-ruddy.vercel.app'
    ],
    credentials: true,
  },
});

initializeIO(io);

io.use(socketAuth);

io.on('connection', (socket) => {
  registerChatSocket(io, socket);
  registerSignalingSocket(io, socket);
  registerFriendSocket(io, socket);
});

connectDB(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Network access: http://10.122.26.200:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });

import { io } from 'socket.io-client';

const resolveSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  const fallback = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (fallback.endsWith('/api')) return fallback.replace('/api', '');
  return fallback;
};

export function ioClient(token) {
  const socket = io(resolveSocketUrl(), {
    autoConnect: true,
    transports: ['websocket'],
    auth: { token },
  });
  return socket;
}

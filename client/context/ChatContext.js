import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useSocket } from './SocketContext';
import { useAuthContext } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuthContext();
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'skillswap-message',
      });
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    const response = await api.get('/chat');
    setRooms(response.data);
  }, [user]);

  const loadMessages = useCallback(
    async (roomId) => {
      if (!roomId) return;
      const response = await api.get(`/chat/${roomId}/messages`);
      setMessages(
        response.data.map((message) => ({
          ...message,
          isOwn: message.sender === user?._id,
        })),
      );
    },
    [user?._id],
  );

  const joinRoom = useCallback(
    async (room) => {
      if (!socket || !room) return;
      if (activeRoom?._id) {
        socket.emit('chat:leave', { roomId: activeRoom._id });
      }
      setActiveRoom(room);
      setTypingUsers([]);
      setUnreadCount(0);
      socket.emit('chat:join', { roomId: room._id });
      await loadMessages(room._id);
    },
    [socket, activeRoom, loadMessages],
  );

  const openRoomWithUser = useCallback(
    async (targetId) => {
      if (!targetId) return null;
      const response = await api.post('/chat', { targetId });
      await fetchRooms();
      const room = response.data;
      await joinRoom(room);
      return room;
    },
    [fetchRooms, joinRoom],
  );

  const sendMessage = useCallback(
    (content) => {
      if (!socket || !activeRoom) return;
      socket.emit('chat:message', {
        roomId: activeRoom._id,
        content,
      });
    },
    [socket, activeRoom],
  );

  const setTyping = useCallback(
    (typing) => {
      if (!socket || !activeRoom) return;
      socket.emit('chat:typing', { roomId: activeRoom._id, typing });
    },
    [socket, activeRoom],
  );

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (message) => {
      const isMessageFromCurrentUser = message.sender === user?._id;
      const isMessageInActiveRoom = message.room === activeRoom?._id;
      
      setMessages((current) => [
        ...current,
        {
          ...message,
          isOwn: isMessageFromCurrentUser,
        },
      ]);

      if (!isMessageFromCurrentUser) {
        if (!isMessageInActiveRoom || !document.hasFocus()) {
          setUnreadCount((count) => count + 1);
        }
        
        if (!document.hasFocus()) {
          showNotification(
            `New message from ${message.senderName}`,
            message.content
          );
        }
      }
    };

    const handleTyping = ({ userId, userName, typing }) => {
      if (userId === user?._id) return;
      setTypingUsers((current) => {
        if (typing) {
          if (current.includes(userName)) return current;
          return [...current, userName];
        }
        return current.filter((name) => name !== userName);
      });
    };

    const handleHistory = (history) => {
      setMessages(
        history.map((message) => ({
          ...message,
          isOwn: message.sender === user?._id,
        })),
      );
    };

    const handleRoomUpdate = (payload) => {
      setRooms(payload);
    };

    socket.on('chat:message', handleIncoming);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:history', handleHistory);
    socket.on('chat:rooms', handleRoomUpdate);

    return () => {
      socket.off('chat:message', handleIncoming);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:history', handleHistory);
      socket.off('chat:rooms', handleRoomUpdate);
    };
  }, [socket, user?._id, activeRoom?._id, showNotification]);

  useEffect(() => {
    if (!user) {
      setRooms([]);
      setMessages([]);
      setTypingUsers([]);
      setActiveRoom(null);
      return;
    }
    fetchRooms();
  }, [user, fetchRooms]);

  const value = useMemo(
    () => ({
      rooms,
      messages,
      typingUsers,
      activeRoom,
      unreadCount,
      joinRoom,
      sendMessage,
      setTyping,
      fetchRooms,
      openRoomWithUser,
    }),
    [rooms, messages, typingUsers, activeRoom, unreadCount, joinRoom, sendMessage, setTyping, fetchRooms, openRoomWithUser],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}

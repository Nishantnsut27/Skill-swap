import { useEffect } from 'react';
import Head from 'next/head';
import ChatBox from '../components/ChatBox';
import { useChat } from '../hooks/useChat';
import { useRequireAuth } from '../hooks/useRequireAuth';

export default function MessagesPage() {
  const { user, loading, isAuthenticated } = useRequireAuth();
  const { rooms, activeRoom, joinRoom, fetchRooms, unreadCount } = useChat();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRooms();
  }, [fetchRooms, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!activeRoom && rooms.length > 0) {
      joinRoom(rooms[0]);
    }
  }, [rooms, activeRoom, joinRoom, isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100vh-8rem)] max-w-7xl">
      <Head>
        <title>{unreadCount > 0 ? `(${unreadCount}) Messages - SkillSwap` : 'Messages - SkillSwap'}</title>
      </Head>
      <div className="grid h-full gap-6 lg:grid-cols-[360px,1fr]">
        <aside className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {rooms.length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="mb-2 text-sm font-semibold text-slate-700">No conversations yet</p>
                <p className="text-xs text-slate-500">Add friends to start chatting with them</p>
              </div>
            ) : (
              <ul className="space-y-1 p-3">
                {rooms.map((room) => {
                  const otherParticipants = room.participants?.filter((p) => p._id !== user?._id) || [];
                  const displayName = otherParticipants.map((p) => p.name).join(', ') || 'Direct chat';
                  const isActive = activeRoom?._id === room._id;
                  
                  return (
                    <li key={room._id}>
                      <button
                        type="button"
                        onClick={() => joinRoom(room)}
                        className={`group relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          isActive
                            ? 'border-slate-900 bg-slate-900 shadow-lg'
                            : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                            isActive ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700 group-hover:bg-slate-300'
                          }`}>
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <h3 className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                {displayName}
                              </h3>
                              {room.lastMessage?.createdAt && (
                                <span className={`flex-shrink-0 text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                  {new Date(room.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                            <p className={`truncate text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                              {room.lastMessage?.content || 'Start a conversation'}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
        
        <ChatBox />
      </div>
    </div>
  );
}

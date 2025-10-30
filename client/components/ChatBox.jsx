import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useWebRTC } from '../context/WebRTCContext';

export default function ChatBox() {
  const router = useRouter();
  const { messages, typingUsers, sendMessage, setTyping, activeRoom } = useChat();
  const { user } = useAuth();
  const { startCall } = useWebRTC();
  const [value, setValue] = useState('');
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activeRoom || !value.trim()) return;
    sendMessage(value.trim());
    setValue('');
    setTyping(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    if (activeRoom) {
      setTyping(event.target.value.length > 0);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  if (!activeRoom) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-lg">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">Welcome to Messages</h3>
        <p className="text-center text-sm text-slate-500">
          Select a conversation from the left to start chatting
        </p>
      </div>
    );
  }

  const otherParticipants = activeRoom.participants?.filter((p) => p._id !== user?._id) || [];
  const chatTitle = otherParticipants.map((p) => p.name).join(', ') || 'Chat';
  const otherParticipantId = otherParticipants[0]?._id;
  const otherParticipant = otherParticipants[0];

  const handleStartVideoCall = () => {
    if (otherParticipant) {
      startCall(otherParticipant);
      router.push('/videocall');
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => otherParticipantId && router.push(`/user/${otherParticipantId}`)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white transition hover:bg-slate-700"
            >
              {chatTitle.charAt(0).toUpperCase()}
            </button>
            <div className="min-w-0 flex-1">
              <button
                onClick={() => otherParticipantId && router.push(`/user/${otherParticipantId}`)}
                className="truncate text-lg font-bold text-slate-900 transition hover:text-slate-700 hover:underline"
              >
                {chatTitle}
              </button>
              {typingUsers.length > 0 && (
                <p className="text-xs text-slate-500">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                  <span className="ml-1 inline-flex gap-0.5">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-75">.</span>
                    <span className="animate-bounce delay-150">.</span>
                  </span>
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleStartVideoCall}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
            title="Start video call"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-semibold text-slate-700">No messages yet</p>
            <p className="text-xs text-slate-500">Start the conversation below</p>
          </div>
        )}
        
        {messages.map((message) => {
          if (message.type === 'call') {
            const isOutgoing = message.caller === user?._id;
            const formatDuration = (seconds) => {
              if (!seconds || seconds === 0) return '0:00';
              const mins = Math.floor(seconds / 60);
              const secs = seconds % 60;
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            return (
              <article key={message._id} className="flex justify-center">
                <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      {isOutgoing ? 'Outgoing' : 'Incoming'} {message.callType} call
                    </span>
                    {message.status === 'completed' && (
                      <span className="text-slate-500">• {formatDuration(message.duration)}</span>
                    )}
                    {message.status === 'missed' && (
                      <span className="text-amber-600">• Missed</span>
                    )}
                    {message.status === 'rejected' && (
                      <span className="text-red-600">• Rejected</span>
                    )}
                  </div>
                  <span className="mt-1 block text-xs text-slate-400">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </article>
            );
          }

          const isOwn = message.isOwn;
          const showName = !isOwn && message.senderName;
          
          return (
            <article
              key={message._id || message.clientId}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[75%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                {showName && (
                  <button
                    onClick={() => router.push(`/user/${message.sender}`)}
                    className="px-3 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                  >
                    {message.senderName}
                  </button>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    isOwn
                      ? 'rounded-br-md bg-slate-900 text-white'
                      : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200'
                  }`}
                >
                  <p className="break-words text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="px-3 text-xs text-slate-400">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              disabled={!activeRoom}
            />
          </div>
          <button
            type="submit"
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-900 disabled:hover:shadow-lg"
            disabled={!activeRoom || !value.trim()}
            aria-label="Send message"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}

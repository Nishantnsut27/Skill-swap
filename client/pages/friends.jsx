import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../context/WebRTCContext';

export default function FriendsPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useRequireAuth();
  const { socket } = useSocket();
  const { openRoomWithUser } = useChat();
  const { startCall } = useWebRTC();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFriends();
    fetchFriendRequests();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    socket.on('friend:request:received', (request) => {
      console.log('Received friend request:', request);
      setReceivedRequests((prev) => [request, ...prev]);
    });

    socket.on('friend:request:accepted', (request) => {
      console.log('Friend request accepted:', request);
      setReceivedRequests((prev) => prev.filter((r) => r._id !== request._id));
      setSentRequests((prev) => prev.filter((r) => r._id !== request._id));
      fetchFriends();
    });

    socket.on('friend:request:rejected', ({ requestId }) => {
      console.log('Friend request rejected:', requestId);
      setReceivedRequests((prev) => prev.filter((r) => r._id !== requestId));
      setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
    });

    return () => {
      socket.off('friend:request:received');
      socket.off('friend:request:accepted');
      socket.off('friend:request:rejected');
    };
  }, [socket]);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        api.get('/friends/requests?type=received'),
        api.get('/friends/requests?type=sent')
      ]);
      setReceivedRequests(received.data);
      setSentRequests(sent.data);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setSearchError('No users found');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setSearchError('Please log in to search for users');
      } else {
        setSearchError(error.response?.data?.message || 'Search failed');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { userId });
      setSearchResults([]);
      setSearchQuery('');
      fetchFriendRequests();
    } catch (error) {
      setSearchError(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/friends/requests/${requestId}`, { action: 'accept' });
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/friends/requests/${requestId}`, { action: 'reject' });
      fetchFriendRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleStartChat = async (friend) => {
    try {
      await openRoomWithUser(friend._id);
      router.push('/messages');
    } catch (error) {
      console.error('Failed to open chat:', error);
    }
  };

  const handleStartVideoCall = async (friend) => {
    try {
      startCall(friend);
      router.push('/videocall');
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="mt-2 text-slate-300">Connect with learners and start conversations</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Add Friend</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            name="search"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User ID, email, or name"
            className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
            disabled={searching}
          />
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && (
          <div className="mt-4 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
            <p className="text-sm font-medium text-rose-800">{searchError}</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {searchResults.map((result) => {
              if (!result || !result.user) return null;
              return (
              <div key={result.user._id} className="rounded-xl border-2 border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-bold text-white shadow-lg">
                      {result.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{result.user.name || 'Unknown'}</h3>
                      <p className="text-sm text-slate-500">@{result.user.userId || 'unknown'}</p>
                      <p className="text-xs text-slate-400">{result.user.email || ''}</p>
                      {result.user.bio && (
                        <p className="mt-2 text-sm text-slate-600">{result.user.bio}</p>
                      )}
                      {result.user.skills && result.user.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {result.user.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {result.isFriend && (
                      <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                        Friends
                      </span>
                    )}
                    {!result.isFriend && !result.requestStatus && (
                      <button
                        onClick={() => handleSendRequest(result.user._id)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                      >
                        Add Friend
                      </button>
                    )}
                    {result.requestStatus === 'pending' && result.requestDirection === 'sent' && (
                      <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                        Request Sent
                      </span>
                    )}
                    {result.requestStatus === 'pending' && result.requestDirection === 'received' && (
                      <span className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                        Pending Response
                      </span>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-200">
          <div className="flex gap-4 px-6 pt-4">
            <button
              onClick={() => setActiveTab('friends')}
              className={`border-b-2 pb-4 text-sm font-bold transition ${
                activeTab === 'friends'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`border-b-2 pb-4 text-sm font-bold transition ${
                activeTab === 'requests'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Requests ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`border-b-2 pb-4 text-sm font-bold transition ${
                activeTab === 'sent'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-sm text-slate-500">Loading...</p>
              ) : friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">No friends yet</p>
                  <p className="text-xs text-slate-500">Search for users by User ID, email, or name to add friends</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                    <button
                      onClick={() => router.push(`/user/${friend._id}`)}
                      className="flex flex-1 items-center gap-3 text-left transition hover:opacity-80"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-bold text-white">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{friend.name}</h3>
                        <p className="text-xs text-slate-500">{friend.email}</p>
                      </div>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartVideoCall(friend)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                        title="Video call"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStartChat(friend)}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {receivedRequests.length === 0 ? (
                <p className="text-center text-sm text-slate-500">No pending requests</p>
              ) : (
                receivedRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
                        {request.from.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{request.from.name}</h3>
                        <p className="text-xs text-slate-500">{request.from.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request._id)}
                        className="rounded-lg bg-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-3">
              {sentRequests.length === 0 ? (
                <p className="text-center text-sm text-slate-500">No sent requests</p>
              ) : (
                sentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-600 text-lg font-bold text-white">
                        {request.to.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{request.to.name}</h3>
                        <p className="text-xs text-slate-500">{request.to.email}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                      Pending
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

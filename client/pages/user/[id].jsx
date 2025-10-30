import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import api from '../../lib/api';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoteComment, setUpvoteComment] = useState('');
  const [showUpvoteForm, setShowUpvoteForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    fetchUserProfile();
  }, [id, isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!upvoteComment.trim()) return;
    
    try {
      setSubmitting(true);
      await api.post(`/users/${id}/upvote`, { comment: upvoteComment });
      setUpvoteComment('');
      setShowUpvoteForm(false);
      fetchUserProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upvote');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUpvote = async () => {
    try {
      await api.delete(`/users/${id}/upvote`);
      fetchUserProfile();
    } catch (error) {
      console.error('Failed to remove upvote:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-600">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Head>
        <title>{user.name} - Profile | SkillSwap</title>
      </Head>

      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-4xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="mt-1 text-slate-300">{user.email}</p>
              {user.country && (
                <p className="mt-2 text-sm text-slate-300">📍 {user.country}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <svg className="h-5 w-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span className="text-xl font-bold">{user.upvoteCount || 0}</span>
              <span className="text-sm text-slate-300">Upvotes</span>
            </div>
            {user.isFriend && !isOwnProfile && (
              <span className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                ✓ Friend
              </span>
            )}
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="mb-3 text-lg font-bold text-slate-900">About</h2>
          <p className="text-slate-700">{user.bio}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {user.skills && user.skills.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {user.interests && user.interests.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {user.isFriend && !isOwnProfile && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Review</h2>
            {!user.hasUpvoted && (
              <button
                onClick={() => setShowUpvoteForm(!showUpvoteForm)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {showUpvoteForm ? 'Cancel' : 'Add Upvote'}
              </button>
            )}
            {user.hasUpvoted && (
              <button
                onClick={handleRemoveUpvote}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-300"
              >
                Remove Upvote
              </button>
            )}
          </div>

          {showUpvoteForm && (
            <div className="space-y-3">
              <textarea
                value={upvoteComment}
                onChange={(e) => setUpvoteComment(e.target.value)}
                placeholder="Share why you recommend this person..."
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                rows="3"
              />
              <button
                onClick={handleUpvote}
                disabled={!upvoteComment.trim() || submitting}
                className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Upvote'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Upvotes & Reviews ({user.upvotes?.length || 0})
        </h2>
        
        {!user.upvotes || user.upvotes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">No upvotes yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {user.upvotes.map((upvote, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-white">
                    {upvote.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{upvote.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(upvote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {upvote.comment && (
                  <p className="text-sm text-slate-700">{upvote.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}

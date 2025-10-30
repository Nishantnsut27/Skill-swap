import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: '',
    userId: '',
    bio: '',
    country: '',
    language: '',
    skills: [],
    interests: [],
  });
  const [originalUserId, setOriginalUserId] = useState('');
  const [userIdStatus, setUserIdStatus] = useState('');
  const [checkingUserId, setCheckingUserId] = useState(false);
  const [badges, setBadges] = useState([]);
  const [sessions, setSessions] = useState(0);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [userId, setUserId] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/me');
        const profile = response.data;
        setUserId(profile._id);
        setOriginalUserId(profile.userId || '');
        setForm({
          name: profile.name || '',
          userId: profile.userId || '',
          bio: profile.bio || '',
          country: profile.country || '',
          language: profile.language || '',
          skills: profile.skills || [],
          interests: profile.interests || [],
        });
        setBadges(profile.badges || []);
        setSessions(profile.completedSessions || 0);
        setUpvoteCount(profile.upvotes?.length || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const debounceTimer = useRef(null);

  useEffect(() => {
    if (form.userId !== originalUserId) {
      if (form.userId.length >= 3) {
        setCheckingUserId(true);
        setUserIdStatus('');
        
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        debounceTimer.current = setTimeout(async () => {
          try {
            const response = await api.get(`/auth/check-userid/${form.userId}`);
            if (response.data.available) {
              setUserIdStatus('available');
            } else {
              setUserIdStatus('taken');
            }
          } catch (err) {
            setUserIdStatus('error');
          } finally {
            setCheckingUserId(false);
          }
        }, 500);
      } else if (form.userId.length > 0) {
        setUserIdStatus('short');
        setCheckingUserId(false);
      } else {
        setUserIdStatus('');
        setCheckingUserId(false);
      }
    } else {
      setUserIdStatus('');
      setCheckingUserId(false);
    }
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [form.userId, originalUserId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleArrayChange = (name) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [name]: value.split(',').map((item) => item.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (form.userId !== originalUserId && userIdStatus !== 'available') {
      setMessage({ type: 'error', text: 'Please choose a valid and available user ID' });
      return;
    }
    
    setPending(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/users/me', form);
      await refresh();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Update failed' });
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg lg:col-span-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Your Profile</h1>
          <p className="mt-2 text-sm text-slate-600">Keep your information up to date for better matches</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="userId" className="text-sm font-bold text-slate-700">
            User ID
          </label>
          <div className="relative">
            <input
              id="userId"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              required
              minLength={3}
              className={`w-full rounded-xl border-2 ${
                form.userId === originalUserId ? 'border-slate-200' :
                userIdStatus === 'available' ? 'border-green-500' :
                userIdStatus === 'taken' ? 'border-red-500' :
                userIdStatus === 'short' ? 'border-yellow-500' :
                'border-slate-200'
              } bg-slate-50 px-4 py-3 pr-10 text-slate-900 transition focus:bg-white focus:outline-none focus:ring-4 ${
                form.userId === originalUserId ? 'focus:ring-slate-900/10' :
                userIdStatus === 'available' ? 'focus:ring-green-500/10' :
                userIdStatus === 'taken' ? 'focus:ring-red-500/10' :
                'focus:ring-slate-900/10'
              }`}
              placeholder="johndoe123"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingUserId && (
                <svg className="h-5 w-5 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {!checkingUserId && form.userId !== originalUserId && userIdStatus === 'available' && (
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!checkingUserId && form.userId !== originalUserId && userIdStatus === 'taken' && (
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>
          {form.userId !== originalUserId && userIdStatus === 'short' && (
            <p className="text-xs text-yellow-600">User ID must be at least 3 characters</p>
          )}
          {form.userId !== originalUserId && userIdStatus === 'taken' && (
            <p className="text-xs text-red-600">This user ID is already taken</p>
          )}
          {form.userId !== originalUserId && userIdStatus === 'available' && (
            <p className="text-xs text-green-600">User ID is available!</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-bold text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-bold text-slate-700">
              Country
            </label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              placeholder="e.g., United States"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-bold text-slate-700">
              Primary Language
            </label>
            <input
              id="language"
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
              placeholder="e.g., English"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="skills" className="text-sm font-bold text-slate-700">
            Skills
          </label>
          <input
            id="skills"
            name="skills"
            value={form.skills.join(', ')}
            onChange={handleArrayChange('skills')}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
            placeholder="e.g., JavaScript, React, Node.js"
          />
          <p className="text-xs text-slate-500">Separate skills with commas</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="interests" className="text-sm font-bold text-slate-700">
            Interests
          </label>
          <input
            id="interests"
            name="interests"
            value={form.interests.join(', ')}
            onChange={handleArrayChange('interests')}
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
            placeholder="e.g., Web Development, Design, Photography"
          />
          <p className="text-xs text-slate-500">Separate interests with commas</p>
        </div>

        {message.text && (
          <div
            className={`rounded-xl p-4 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl disabled:opacity-50"
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Credibility</h2>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-center text-white shadow-xl">
              <p className="text-4xl font-bold">{upvoteCount}</p>
              <p className="mt-2 text-sm text-emerald-100">Friend Upvotes</p>
            </div>
            <button
              onClick={() => router.push(`/user/${userId}`)}
              className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
            >
              View Public Profile
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Progress</h2>
          </div>
          
          <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-center text-white shadow-xl">
            <p className="text-4xl font-bold">{sessions}</p>
            <p className="mt-2 text-sm text-slate-300">Completed Sessions</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Badges</h3>
          </div>

          <ul className="mt-4 space-y-2">
            {badges.length === 0 ? (
              <li className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-600">No badges yet</p>
                <p className="mt-1 text-xs text-slate-500">Complete sessions to earn badges</p>
              </li>
            ) : (
              badges.map((badge) => (
                <li key={badge} className="flex items-center gap-2 rounded-lg bg-purple-50 p-3">
                  <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-900">{badge}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}

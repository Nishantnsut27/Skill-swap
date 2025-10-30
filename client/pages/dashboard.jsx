import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MatchList from '../components/MatchList';
import ProfileCard from '../components/ProfileCard';
import api from '../lib/api';
import { useChat } from '../hooks/useChat';
import { useRequireAuth } from '../hooks/useRequireAuth';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openRoomWithUser } = useChat();
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useRequireAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    const run = async () => {
      try {
        setLoading(true);
        const profileResponse = await api.get('/users/me');
        setProfile(profileResponse.data);
        const matchResponse = await api.get('/match');
        setMatches(matchResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated]);

  const handleSelectMatch = async (match) => {
    try {
      await openRoomWithUser(match._id);
      router.push('/messages');
    } catch (error) {
      console.error('Failed to open chat:', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name || 'there'}! 👋</h1>
        <p className="mt-2 text-slate-300">
          {matches.length > 0
            ? `You have ${matches.length} ${matches.length === 1 ? 'match' : 'matches'} waiting to connect with you.`
            : 'Complete your profile to find amazing matches!'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCard profile={profile} cta="Edit Profile" onAction={() => router.push('/profile')} />
        </div>
        <div className="lg:col-span-2">
          <MatchList matches={matches} onSelect={handleSelectMatch} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{matches.length}</p>
              <p className="text-sm text-slate-600">Active Matches</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{profile?.skills?.length || 0}</p>
              <p className="text-sm text-slate-600">Your Skills</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{profile?.badges?.length || 0}</p>
              <p className="text-sm text-slate-600">Badges Earned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

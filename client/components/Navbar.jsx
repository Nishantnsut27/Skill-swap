import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useChat();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path) => router.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 transition hover:text-slate-600">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-bold text-white shadow-lg">
            SS
          </div>
          SkillSwap
        </Link>
        
        {user && (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive('/dashboard')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/friends"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive('/friends')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Friends
            </Link>
            <Link
              href="/messages"
              className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive('/messages')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/videocall"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive('/videocall')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Video Call
            </Link>
            <Link
              href="/profile"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isActive('/profile')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Profile
            </Link>
            
            <div className="ml-4 h-8 w-px bg-slate-200"></div>
            
            <div className="ml-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-md">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden text-sm font-medium text-slate-700 md:inline">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        
        {!user && (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

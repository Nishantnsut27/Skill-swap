import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    userId: '',
    email: '',
    password: '',
    country: '',
    language: '',
    skills: '',
    interests: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userIdStatus, setUserIdStatus] = useState('');
  const [checkingUserId, setCheckingUserId] = useState(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
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
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [form.userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (userIdStatus !== 'available') {
      setError('Please choose a valid and available user ID');
      return;
    }
    
    setPending(true);
    setError('');
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean),
      };
      await register(payload);
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-2xl font-bold text-white shadow-2xl">
            SS
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Join SkillSwap</h1>
          <p className="mt-2 text-sm text-slate-600">Create your account and start learning together</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="userId" className="text-sm font-bold text-slate-700">
                User ID (unique)
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
                    userIdStatus === 'available' ? 'border-green-500' :
                    userIdStatus === 'taken' ? 'border-red-500' :
                    userIdStatus === 'short' ? 'border-yellow-500' :
                    'border-slate-200'
                  } bg-slate-50 px-4 py-3 pr-10 text-slate-900 transition focus:bg-white focus:outline-none focus:ring-4 ${
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
                  {!checkingUserId && userIdStatus === 'available' && (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!checkingUserId && userIdStatus === 'taken' && (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {userIdStatus === 'short' && (
                <p className="text-xs text-yellow-600">User ID must be at least 3 characters</p>
              )}
              {userIdStatus === 'taken' && (
                <p className="text-xs text-red-600">This user ID is already taken</p>
              )}
              {userIdStatus === 'available' && (
                <p className="text-xs text-green-600">User ID is available!</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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
                placeholder="United States"
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
                placeholder="English"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="skills" className="text-sm font-bold text-slate-700">
                Your Skills
              </label>
              <input
                id="skills"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                placeholder="JavaScript, React, Node.js"
              />
              <p className="text-xs text-slate-500">Separate skills with commas</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="interests" className="text-sm font-bold text-slate-700">
                Your Interests
              </label>
              <input
                id="interests"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                placeholder="Web Development, Design, Photography"
              />
              <p className="text-xs text-slate-500">Separate interests with commas</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-rose-800">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl disabled:opacity-50 disabled:hover:bg-slate-900"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

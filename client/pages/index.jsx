import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 ring-2 ring-emerald-200">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Learn Together, Grow Together
              </span>
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900 lg:text-6xl">
              Exchange Skills with a Global Community
            </h1>
            <p className="text-xl leading-relaxed text-slate-600">
              Connect with mentors and learners worldwide. SkillSwap uses AI to find your perfect match and provides real-time chat and video calls for seamless collaboration.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-2xl transition hover:bg-slate-700 hover:shadow-3xl"
            >
              Get Started Free
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-8 py-4 text-base font-bold text-slate-900 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-slate-900">10k+</p>
              <p className="text-sm text-slate-600">Active Learners</p>
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">50+</p>
              <p className="text-sm text-slate-600">Countries</p>
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">100+</p>
              <p className="text-sm text-slate-600">Skills</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-2xl">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-3 text-2xl font-bold">Real-time Collaboration</h3>
            <p className="text-slate-300">Chat, video calls, and shared practice rooms all built in. Connect face-to-face with your learning partners anywhere in the world.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-2xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-2 font-bold text-slate-900">AI-Powered Matching</h3>
              <p className="text-sm text-slate-600">Smart algorithms find mentors that complement your skills and goals with explainable recommendations.</p>
            </div>

            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-2xl">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="mb-2 font-bold text-slate-900">Earn Badges</h3>
              <p className="text-sm text-slate-600">Celebrate milestones as you learn and teach across cultures with our achievement system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-12 text-center shadow-xl">
        <h2 className="mb-4 text-3xl font-bold text-slate-900">Ready to Start Learning?</h2>
        <p className="mb-8 text-lg text-slate-600">Join thousands of learners exchanging skills every day</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-2xl transition hover:bg-slate-700"
        >
          Create Your Free Account
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>
    </div>
  );
}

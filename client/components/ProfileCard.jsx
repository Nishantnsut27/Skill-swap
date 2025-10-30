export default function ProfileCard({ profile, cta, onAction }) {
  if (!profile) {
    return (
      <article className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Loading profile...</p>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-bold text-white shadow-lg">
          {profile.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-slate-900">{profile.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            {profile.country && (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.country}</span>
              </>
            )}
            {profile.language && profile.country && <span>•</span>}
            {profile.language && <span>{profile.language}</span>}
          </div>
        </div>
      </div>

      {profile.bio && (
        <div>
          <p className="text-sm leading-relaxed text-slate-600">{profile.bio}</p>
        </div>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {cta && (
        <button
          type="button"
          onClick={onAction}
          className="mt-auto rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-700 hover:shadow-xl"
        >
          {cta}
        </button>
      )}
    </article>
  );
}

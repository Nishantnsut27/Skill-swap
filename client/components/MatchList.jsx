export default function MatchList({ matches, onSelect }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-lg">
      <header className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Matches</h2>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {matches.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">Connect with people who share your interests</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {matches.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="mb-2 text-sm font-semibold text-slate-700">No matches yet</p>
            <p className="text-xs text-slate-500">Complete your profile to discover amazing people</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match._id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(match)}
                  className="group relative w-full overflow-hidden rounded-xl border-2 border-transparent bg-slate-50 p-4 text-left transition-all hover:border-slate-200 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-bold text-white shadow-md">
                      {match.name?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900">{match.name}</h3>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1">
                          <svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold text-emerald-700">
                            {Math.round((match.score || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                      {match.bio && (
                        <p className="mb-2 line-clamp-2 text-xs text-slate-600">{match.bio}</p>
                      )}
                      {match.skills && match.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {match.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.skills.length > 3 && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                              +{match.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

import ChatBox from './ChatBox';
import VideoCallWindow from './VideoCallWindow';

export default function CallGrid({ matches = [], onSelectMatch, selectedMatch }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.6fr,0.4fr]">
      <VideoCallWindow selectedMatch={selectedMatch} />
      <div className="space-y-6">
        <ChatBox />
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Active Learners</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {matches.map((match) => (
              <li key={match._id}>
                <button
                  type="button"
                  onClick={() => onSelectMatch?.(match)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                    selectedMatch?._id === match._id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-transparent bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className={`${selectedMatch?._id === match._id ? 'font-semibold text-white' : 'font-semibold text-slate-900'}`}>
                    {match.name}
                  </span>
                  <span className={`text-xs font-medium uppercase tracking-wide ${
                    selectedMatch?._id === match._id ? 'text-emerald-200' : 'text-emerald-600'
                  }`}>
                    {match.score ? `${Math.round(match.score * 100)}%` : 'New'}
                  </span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li>No one is available right now.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

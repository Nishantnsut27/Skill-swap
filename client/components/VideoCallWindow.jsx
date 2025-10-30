import { useCall } from '../hooks/useCall';

export default function VideoCallWindow({ selectedMatch }) {
  const {
    localVideoRef,
    remoteVideoRef,
    inCall,
    startCall,
    endCall,
    toggles,
    isInitiator,
    callTarget,
  } = useCall();

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Video Call</h2>
        <div className="text-sm text-slate-500">
          {inCall ? `Connected with ${callTarget}` : selectedMatch ? `Ready to call ${selectedMatch.name}` : 'Ready to connect'}
        </div>
      </header>
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <video
          ref={localVideoRef}
          className="h-64 w-full rounded-xl bg-slate-900/80 object-cover"
          autoPlay
          muted
          playsInline
        />
        <video
          ref={remoteVideoRef}
          className="h-64 w-full rounded-xl bg-slate-900/80 object-cover"
          autoPlay
          playsInline
        />
      </div>
      <footer className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {isInitiator ? 'You started this call' : 'Incoming call ready'}
        </div>
        <div className="flex gap-2">
          {!inCall ? (
            <button
              type="button"
              onClick={() => startCall(selectedMatch)}
              disabled={!selectedMatch}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              Start Call
            </button>
          ) : (
            <button
              type="button"
              onClick={endCall}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
            >
              End Call
            </button>
          )}
          <button
            type="button"
            onClick={toggles.toggleMic}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
          >
            {toggles.mic ? 'Mute' : 'Unmute'}
          </button>
          <button
            type="button"
            onClick={toggles.toggleCamera}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
          >
            {toggles.camera ? 'Camera Off' : 'Camera On'}
          </button>
        </div>
      </footer>
    </section>
  );
}

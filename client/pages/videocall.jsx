import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWebRTC } from '../context/WebRTCContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useSocket } from '../context/SocketContext';
import api from '../lib/api';

export default function VideoCallPage() {
  const router = useRouter();
  const { socket } = useSocket();
  const { loading: authLoading, isAuthenticated, user } = useRequireAuth();
  const { localVideoRef, remoteVideoRef, inCall, callTarget, endCall, toggles } = useWebRTC();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [callStartTime, setCallStartTime] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, fromName, fromId }) => {
      setIncomingCall({ from, fromName, fromId });
      setCallState('incoming');
      
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCh+zfPTgjMGHm7A7+OZURE'; 
      audio.loop = true;
      audio.play().catch(console.error);
      
      window.ringtone = audio;
    };

    const handleCallAccepted = () => {
      setCallState('connected');
      setCallStartTime(Date.now());
      if (window.ringtone) {
        window.ringtone.pause();
        window.ringtone = null;
      }
    };

    const handleCallRejected = () => {
      setCallState('rejected');
      if (window.ringtone) {
        window.ringtone.pause();
        window.ringtone = null;
      }
      setTimeout(() => {
        router.push('/messages');
      }, 2000);
    };

    const handleCallEnded = () => {
      setCallState('idle');
      setIncomingCall(null);
      setCallStartTime(null);
      if (window.ringtone) {
        window.ringtone.pause();
        window.ringtone = null;
      }
      router.push('/messages');
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:end', handleCallEnded);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:end', handleCallEnded);
      if (window.ringtone) {
        window.ringtone.pause();
        window.ringtone = null;
      }
    };
  }, [socket, router]);

  const handleAcceptCall = async () => {
    if (window.ringtone) {
      window.ringtone.pause();
      window.ringtone = null;
    }
    setCallState('connecting');
    socket.emit('call:accept', { targetId: incomingCall.fromId });
  };

  const handleRejectCall = () => {
    if (window.ringtone) {
      window.ringtone.pause();
      window.ringtone = null;
    }
    socket.emit('call:reject', { targetId: incomingCall.fromId });
    setIncomingCall(null);
    setCallState('idle');
    router.push('/messages');
  };
  const handleEndCall = async () => {
    const callDuration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
    
    if (callDuration > 0) {
      await api.post('/chat/call-log', {
        targetId: incomingCall?.fromId || callTarget?._id,
        duration: callDuration,
        type: 'video'
      }).catch(console.error);
    }

    endCall();
    setCallState('idle');
    setIncomingCall(null);
    setCallStartTime(null);
    router.push('/messages');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (callState === 'idle' && callTarget && !inCall) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Head>
          <title>Calling... - SkillSwap</title>
        </Head>
        <div className="text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-3xl font-bold text-white shadow-lg mx-auto animate-pulse">
            {callTarget.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Calling {callTarget.name}...</h2>
          <p className="mb-6 text-sm text-slate-600">Waiting for response</p>
          <div className="flex justify-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce"></div>
            <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <button
            onClick={() => {
              endCall();
              router.push('/messages');
            }}
            className="rounded-xl bg-rose-600 px-8 py-3 font-bold text-white shadow-lg transition hover:bg-rose-700"
          >
            Cancel Call
          </button>
        </div>
      </div>
    );
  }

  if (callState === 'incoming' && incomingCall) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Head>
          <title>Incoming Call - SkillSwap</title>
        </Head>
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-3xl font-bold text-white shadow-lg animate-pulse">
              {incomingCall.fromName?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-slate-900">{incomingCall.fromName}</h2>
            <p className="mb-1 text-slate-600">is calling you to learn skills</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
              <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold">Incoming Video Call</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRejectCall}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-rose-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
            <button
              onClick={handleAcceptCall}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg transition hover:bg-emerald-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (callState === 'rejected') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mx-auto">
            <svg className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-900">Call Rejected</p>
        </div>
      </div>
    );
  }

  if (!inCall && callState !== 'connecting') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">No Active Call</h2>
          <p className="mb-6 text-sm text-slate-600">Start a video call from the messages page</p>
          <button
            onClick={() => router.push('/messages')}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Go to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Head>
        <title>Video Call - SkillSwap</title>
      </Head>

      <div className="relative h-full rounded-2xl bg-slate-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {callState === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="text-center text-white">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 mx-auto">
                  <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold">Connecting to {callTarget || incomingCall?.fromName}...</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-20 left-6 h-48 w-64 overflow-hidden rounded-xl border-4 border-white shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover mirror"
          />
        </div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 px-6 py-3 backdrop-blur-sm">
          <p className="text-sm font-semibold text-white">
            {callTarget || incomingCall?.fromName ? `Call with ${callTarget || incomingCall?.fromName}` : 'Video Call'}
          </p>
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4">
          <button
            onClick={toggles.toggleMic}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition ${
              toggles.mic
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
            title={toggles.mic ? 'Mute' : 'Unmute'}
          >
            {toggles.mic ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition hover:bg-rose-700"
            title="End call"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          <button
            onClick={toggles.toggleCamera}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition ${
              toggles.camera
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
            title={toggles.camera ? 'Turn off camera' : 'Turn on camera'}
          >
            {toggles.camera ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}


import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createWebRTCClient } from '../lib/webrtc';
import { useSocket } from './SocketContext';
import { useAuthContext } from './AuthContext';

const WebRTCContext = createContext(null);

export function WebRTCProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuthContext();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const rtcRef = useRef(null);
  const [state, setState] = useState({ inCall: false, isInitiator: false, targetId: null });
  const [toggles, setToggles] = useState({ mic: true, camera: true });
  const [callTarget, setCallTarget] = useState(null);

  const updateState = useCallback((next) => {
    setState((current) => ({ ...current, ...next }));
  }, []);

  useEffect(() => {
    if (!socket) return;

    rtcRef.current = createWebRTCClient({
      socket,
      localVideoRef,
      remoteVideoRef,
      onStateChange: updateState,
    });

    const handleInit = (payload) => {
      setCallTarget(payload.fromName);
    };

    const handleCallAccepted = async (payload) => {
      rtcRef.current?.startCall({ calleeId: payload.targetId });
    };

    const handleOffer = (payload) => {
      setCallTarget(payload.fromName);
      rtcRef.current?.handleOffer(payload);
    };

    const handleAnswer = (payload) => {
      rtcRef.current?.handleAnswer(payload);
    };

    const handleIce = (payload) => {
      rtcRef.current?.handleIceCandidate(payload);
    };

    const handleEnd = () => {
      setCallTarget(null);
      rtcRef.current?.endCall({ silent: true });
    };

    socket.on('call:init', handleInit);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice', handleIce);
    socket.on('call:end', handleEnd);

    return () => {
      socket.off('call:init', handleInit);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice', handleIce);
      socket.off('call:end', handleEnd);
      rtcRef.current?.destroy();
      rtcRef.current = null;
    };
  }, [socket, updateState]);

  const startCall = useCallback(
    (target) => {
      if (!socket || !target) return;
      setCallTarget(target.name);
      socket.emit('call:initiate', { 
        targetId: target._id, 
        fromName: user?.name,
        fromId: user?._id 
      });
    },
    [socket, user],
  );

  const endCall = useCallback(() => {
    setCallTarget(null);
    setToggles({ mic: true, camera: true });
    rtcRef.current?.endCall();
  }, []);

  const toggleMic = useCallback(() => {
    setToggles((current) => {
      const next = { ...current, mic: !current.mic };
      rtcRef.current?.toggleMic(next.mic);
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setToggles((current) => {
      const next = { ...current, camera: !current.camera };
      rtcRef.current?.toggleCamera(next.camera);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      localVideoRef,
      remoteVideoRef,
      inCall: state.inCall,
      isInitiator: state.isInitiator,
      callTarget,
      startCall,
      endCall,
      toggles: { ...toggles, toggleMic, toggleCamera },
    }),
    [state, callTarget, startCall, endCall, toggles, toggleMic, toggleCamera],
  );

  return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>;
}

export function useWebRTC() {
  const context = useContext(WebRTCContext);
  if (!context) throw new Error('useWebRTC must be used within WebRTCProvider');
  return context;
}

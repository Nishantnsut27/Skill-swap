const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function createWebRTCClient({ socket, localVideoRef, remoteVideoRef, onStateChange }) {
  let peerConnection;
  let localStream;
  let remoteStream;
  let targetId;
  let pendingIceCandidates = [];

  const updateState = (state) => {
    onStateChange?.(state);
  };

  const attachLocalStream = async () => {
    if (localStream) return localStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    } catch (error) {
      console.warn('Failed to get video, trying audio only:', error);
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (audioError) {
        console.error('Failed to get media:', audioError);
        throw new Error('Could not access camera or microphone. Please check permissions.');
      }
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    return localStream;
  };

  const ensurePeer = () => {
    if (peerConnection) return peerConnection;
    peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && targetId) {
        socket.emit('call:ice', { targetId, candidate: event.candidate });
      }
    };
    peerConnection.ontrack = ({ streams }) => {
      remoteStream = streams[0];
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    };
    peerConnection.onconnectionstatechange = () => {
      updateState({ connection: peerConnection.connectionState });
    };
    return peerConnection;
  };

  const addTracks = (stream) => {
    const peer = ensurePeer();
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  };

  const startCall = async ({ calleeId }) => {
    targetId = calleeId;
    const stream = await attachLocalStream();
    addTracks(stream);
    const peer = ensurePeer();
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('call:offer', { targetId, description: offer });
    updateState({ inCall: true, isInitiator: true, targetId });
  };

  const handleOffer = async ({ from, description }) => {
    targetId = from;
    const stream = await attachLocalStream();
    addTracks(stream);
    const peer = ensurePeer();
    await peer.setRemoteDescription(description);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('call:answer', { targetId: from, description: answer });
    updateState({ inCall: true, isInitiator: false, targetId: from });
  };

  const handleAnswer = async ({ description }) => {
    const peer = ensurePeer();
    await peer.setRemoteDescription(description);
    
    while (pendingIceCandidates.length > 0) {
      const candidate = pendingIceCandidates.shift();
      await peer.addIceCandidate(candidate).catch(console.error);
    }
  };

  const handleIceCandidate = async ({ candidate }) => {
    if (!candidate) return;
    const peer = ensurePeer();
    
    if (peer.remoteDescription) {
      await peer.addIceCandidate(candidate).catch(console.error);
    } else {
      pendingIceCandidates.push(candidate);
    }
  };

  const endCall = (payload = {}) => {
    if (!payload.silent && targetId) {
      socket.emit('call:end', { targetId, ...payload });
    }
    cleanup();
  };

  const cleanup = () => {
    peerConnection?.close();
    peerConnection = undefined;
    targetId = undefined;
    pendingIceCandidates = [];
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = undefined;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      remoteStream = undefined;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    updateState({ inCall: false });
  };

  const toggleTrack = (kind, enabled) => {
    if (!localStream) return false;
    const track = localStream.getTracks().find((item) => item.kind === kind);
    if (!track) return false;
    track.enabled = enabled;
    return track.enabled;
  };

  const destroy = () => {
    if (targetId) {
      socket.emit('call:end', { targetId });
    }
    localStream?.getTracks().forEach((track) => track.stop());
    localStream = undefined;
    cleanup();
  };

  return {
    startCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    endCall,
    destroy,
    toggleMic: (enabled) => toggleTrack('audio', enabled),
    toggleCamera: (enabled) => toggleTrack('video', enabled),
  };
}

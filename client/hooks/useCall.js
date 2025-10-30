import { useWebRTC } from '../context/WebRTCContext';

export function useCall() {
  return useWebRTC();
}

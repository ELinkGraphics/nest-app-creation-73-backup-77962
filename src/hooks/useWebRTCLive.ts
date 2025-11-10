import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface WebRTCConfig {
  streamId: string | null;
  role: 'host' | 'audience';
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to?: string;
}

export const useWebRTCLive = ({ streamId, role }: WebRTCConfig) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ICE servers configuration (using free STUN servers)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ]
  };

  // Create peer connection for a specific viewer
  const createPeerConnection = useCallback((viewerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(iceServers);

    // Add local stream tracks to peer connection (for host)
    if (role === 'host' && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current && streamId) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'signaling',
          payload: {
            type: 'ice-candidate',
            data: event.candidate,
            from: supabase.auth.getUser().then(u => u.data.user?.id),
            to: viewerId,
            streamId
          }
        });
      }
    };

    // Handle remote stream (for audience)
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(viewerId, event.streams[0]);
        return newMap;
      });
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peerConnectionsRef.current.delete(viewerId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(viewerId);
          return newMap;
        });
      }
    };

    peerConnectionsRef.current.set(viewerId, pc);
    return pc;
  }, [role, streamId]);

  // Handle signaling messages
  const handleSignaling = useCallback(async (message: SignalingMessage) => {
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;

    // Ignore messages not meant for us
    if (message.to && message.to !== userId) return;

    const senderId = message.from;
    let pc = peerConnectionsRef.current.get(senderId);

    if (!pc && message.type !== 'offer') return;

    switch (message.type) {
      case 'offer':
        // Audience receives offer from host
        if (role === 'audience') {
          pc = createPeerConnection(senderId);
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          if (channelRef.current && streamId) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'signaling',
              payload: {
                type: 'answer',
                data: answer,
                from: userId,
                to: senderId,
                streamId
              }
            });
          }
        }
        break;

      case 'answer':
        // Host receives answer from audience
        if (role === 'host' && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(message.data));
        }
        break;

      case 'ice-candidate':
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(message.data));
        }
        break;
    }
  }, [role, streamId, createPeerConnection]);

  // Initialize WebRTC
  useEffect(() => {
    if (!streamId) {
      console.log('useWebRTCLive: waiting for stream ID');
      return;
    }

    console.log('useWebRTCLive: initializing with stream:', streamId);

    const init = async () => {
      try {
        // Set up signaling channel
        const channel = supabase.channel(`live-signaling-${streamId}`);
        channelRef.current = channel;

        // Listen for signaling messages
        channel
          .on('broadcast', { event: 'signaling' }, ({ payload }) => {
            if (payload.streamId === streamId) {
              handleSignaling(payload as SignalingMessage);
            }
          })
          .subscribe(async (status) => {
            if (status !== 'SUBSCRIBED') return;

            // Host: start local media and send offers to viewers
            if (role === 'host') {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  frameRate: { ideal: 30 }
                },
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true
                }
              });

              setLocalStream(stream);
              localStreamRef.current = stream;

              // Send presence to signal we're live
              await channel.track({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                role: 'host',
                online_at: new Date().toISOString()
              });

              toast.success('Live stream started!');
            }

            // Audience: signal presence and wait for offer
            if (role === 'audience') {
              await channel.track({
                user_id: (await supabase.auth.getUser()).data.user?.id,
                role: 'audience',
                online_at: new Date().toISOString()
              });
            }
          });

        // Listen for new viewers joining (host only)
        if (role === 'host') {
          channel.on('presence', { event: 'join' }, async ({ key, newPresences }) => {
            for (const presence of newPresences) {
              if (presence.role === 'audience' && presence.user_id) {
                const viewerId = presence.user_id;
                const pc = createPeerConnection(viewerId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                channel.send({
                  type: 'broadcast',
                  event: 'signaling',
                  payload: {
                    type: 'offer',
                    data: offer,
                    from: (await supabase.auth.getUser()).data.user?.id,
                    to: viewerId,
                    streamId
                  }
                });
              }
            }
          });
        }

      } catch (error: any) {
        console.error('Error initializing WebRTC:', error);
        toast.error(`Failed to ${role === 'host' ? 'start' : 'join'} live stream: ${error.message}`);
      }
    };

    init();

    return () => {
      // Cleanup
      console.log('useWebRTCLive: cleaning up');
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      setLocalStream(null);
      setRemoteStreams(new Map());
      setIsConnected(false);
    };
  }, [streamId, role, createPeerConnection, handleSignaling]);

  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicMuted;
      });
      setIsMicMuted(!isMicMuted);
    }
  }, [isMicMuted]);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    }
  }, [isCameraOff]);

  const switchCamera = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      if (videoDevices.length > 1) {
        const currentDeviceId = videoTrack.getSettings().deviceId;
        const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
        const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];
        
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: nextDevice.deviceId }
        });
        
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        // Replace track in peer connections
        peerConnectionsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
        
        videoTrack.stop();
        localStreamRef.current.removeTrack(videoTrack);
        localStreamRef.current.addTrack(newVideoTrack);
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        
        toast.success('Camera switched');
      }
    }
  }, []);

  return {
    localStream,
    remoteStreams,
    isConnected,
    isMicMuted,
    isCameraOff,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
};

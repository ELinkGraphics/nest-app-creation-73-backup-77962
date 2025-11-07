import { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IAgoraRTCRemoteUser,
  ILocalVideoTrack,
  ILocalAudioTrack
} from 'agora-rtc-sdk-ng';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

AgoraRTC.setLogLevel(4); // Only errors in production

interface AgoraConfig {
  channelName: string;
  role: 'host' | 'audience';
}

export const useAgoraLive = ({ channelName, role }: AgoraConfig) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Create Agora client
        const client = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });
        clientRef.current = client;

        // Set up event listeners
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          console.log('Subscribed to user:', user.uid, mediaType);

          if (mediaType === 'video') {
            setRemoteUsers((prev) => {
              const exists = prev.find((u) => u.uid === user.uid);
              if (exists) return prev;
              return [...prev, user];
            });
          }

          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          console.log('User unpublished:', user.uid, mediaType);
          if (mediaType === 'video') {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
        });

        client.on('user-left', (user) => {
          console.log('User left:', user.uid);
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        // Get Agora token from edge function
        const { data, error } = await supabase.functions.invoke('generate-agora-token', {
          body: {
            channelName,
            role: role === 'host' ? 1 : 2, // 1 = publisher, 2 = subscriber
          },
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        const { token, appId, uid } = data;

        console.log('Token response:', { 
          appId, 
          channelName, 
          uid, 
          tokenLength: token?.length,
          appIdType: typeof appId,
          appIdValue: appId 
        });

        if (!appId || !token) {
          throw new Error(`Missing credentials - appId: ${!!appId}, token: ${!!token}`);
        }

        // Join channel
        console.log('Attempting to join with:', appId, channelName, uid);
        await client.join(appId, channelName, token, uid);
        setIsJoined(true);

        // If host, create and publish local tracks
        if (role === 'host') {
          const [audioTrack, videoTrack] = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack({
              encoderConfig: 'music_standard',
            }),
            AgoraRTC.createCameraVideoTrack({
              encoderConfig: '720p_2',
            }),
          ]);

          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);

          await client.publish([audioTrack, videoTrack]);
          console.log('Published local tracks');
        }

        toast.success(role === 'host' ? 'Live stream started!' : 'Joined live stream!');
      } catch (error: any) {
        console.error('Error initializing Agora:', error);
        toast.error(`Failed to ${role === 'host' ? 'start' : 'join'} live stream: ${error.message}`);
      }
    };

    init();

    return () => {
      // Cleanup
      const cleanup = async () => {
        if (localAudioTrack) {
          localAudioTrack.close();
        }
        if (localVideoTrack) {
          localVideoTrack.close();
        }
        if (clientRef.current) {
          await clientRef.current.leave();
        }
      };
      cleanup();
    };
  }, [channelName, role]);

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(isMicMuted);
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleCamera = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(isCameraOff);
      setIsCameraOff(!isCameraOff);
    }
  };

  const switchCamera = async () => {
    if (localVideoTrack) {
      const devices = await AgoraRTC.getCameras();
      const currentDevice = localVideoTrack.getMediaStreamTrack().getSettings().deviceId;
      const currentIndex = devices.findIndex((d) => d.deviceId === currentDevice);
      const nextDevice = devices[(currentIndex + 1) % devices.length];
      await localVideoTrack.setDevice(nextDevice.deviceId);
      toast.success('Camera switched');
    }
  };

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    isMicMuted,
    isCameraOff,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
};

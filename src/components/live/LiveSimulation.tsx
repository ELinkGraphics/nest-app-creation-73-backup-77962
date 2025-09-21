import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Camera, CameraOff, RotateCcw, Sparkles, MapPin, Users, Heart, MessageCircle, Eye, MoreVertical, PhoneOff } from 'lucide-react';

interface LiveConfig {
  type: 'random' | 'circle';
  circleId?: string;
  circleName?: string;
  title: string;
  description: string;
  filters: boolean;
  cameraFlipped: boolean;
  micEnabled: boolean;
  locationVisible: boolean;
  visibility: 'public' | 'friends' | 'circle';
}

interface LiveSimulationProps {
  config: LiveConfig;
  onEndLive: () => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface Viewer {
  id: string;
  name: string;
  avatar: string;
}

const LiveSimulation: React.FC<LiveSimulationProps> = ({ config, onEndLive }) => {
  const [viewers, setViewers] = useState(12);
  const [likes, setLikes] = useState(34);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', user: 'Sarah_M', text: 'Hey! Great to see you live! 👋', timestamp: new Date(Date.now() - 30000) },
    { id: '2', user: 'Mike_Jones', text: 'This is awesome!', timestamp: new Date(Date.now() - 20000) }
  ]);
  const [duration, setDuration] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Simulate live engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
      
      // Randomly add viewers
      if (Math.random() < 0.3) {
        setViewers(prev => prev + Math.floor(Math.random() * 3));
      }
      
      // Randomly add likes
      if (Math.random() < 0.4) {
        setLikes(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
      
      // Randomly add comments
      if (Math.random() < 0.2) {
        const newComments = [
          'Love this!',
          'Keep it up! 🔥',
          'Amazing content',
          'Can you show more?',
          'This is so cool!',
          'Where are you streaming from?',
          'Great quality!',
          'Hey from New York!'
        ];
        
        const randomComment = newComments[Math.floor(Math.random() * newComments.length)];
        const randomUser = `User${Math.floor(Math.random() * 1000)}`;
        
        setComments(prev => [...prev, {
          id: Date.now().toString(),
          user: randomUser,
          text: randomComment,
          timestamp: new Date()
        }].slice(-20)); // Keep only last 20 comments
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndLive = () => {
    setShowEndConfirm(true);
  };

  const confirmEndLive = () => {
    onEndLive();
  };

  return (
    <div className="relative h-[80vh] bg-gray-900 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30" />
      
      {/* Live Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Live Stats */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm backdrop-blur-sm flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {viewers}
        </div>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-sm backdrop-blur-sm flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {likes}
        </div>
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-20 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
          <h3 className="font-semibold text-lg">{config.title}</h3>
          {config.description && (
            <p className="text-sm opacity-90 mt-1">{config.description}</p>
          )}
          {config.type === 'circle' && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-80">
              <Users className="w-3 h-3" />
              <span>Broadcasting to {config.circleName}</span>
            </div>
          )}
          {config.locationVisible && (
            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
              <MapPin className="w-3 h-3" />
              <span>New York, NY</span>
            </div>
          )}
        </div>
      </div>

      {/* Comments Stream */}
      <div className="absolute bottom-32 left-4 right-20 max-h-32 overflow-hidden">
        <div className="space-y-1">
          {comments.slice(-5).map((comment) => (
            <div key={comment.id} className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-sm animate-fade-in">
              <span className="font-medium text-blue-300">{comment.user}</span>
              <span className="ml-1">{comment.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mic Control */}
            <button
              className={`p-2 rounded-full transition-colors ${
                config.micEnabled ? 'bg-white/20' : 'bg-red-500'
              }`}
            >
              {config.micEnabled ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Camera Control */}
            <button className="p-2 rounded-full bg-white/20">
              <Camera className="w-5 h-5 text-white" />
            </button>

            {/* Camera Flip */}
            <button className="p-2 rounded-full bg-white/20">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>

            {/* Filters */}
            {config.filters && (
              <button className="p-2 rounded-full bg-purple-500">
                <Sparkles className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* More Options */}
            <button className="p-2 rounded-full bg-white/20">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {/* End Live */}
            <button
              onClick={handleEndLive}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-white font-medium transition-colors flex items-center gap-1"
            >
              <PhoneOff className="w-4 h-4" />
              End
            </button>
          </div>
        </div>
      </div>

      {/* End Live Confirmation */}
      {showEndConfirm && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">End Live Stream?</h3>
            <p className="text-gray-600 text-sm mb-6">
              You've been live for {formatDuration(duration)} with {viewers} viewers.
              Are you sure you want to end your live stream?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndLive}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSimulation;
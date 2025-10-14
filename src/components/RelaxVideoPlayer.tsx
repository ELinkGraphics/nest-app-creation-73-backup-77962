import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Heart, MessageCircle, Share, Bookmark, Music, Plus, Check } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { cn } from '@/lib/utils';
import FooterNav from './FooterNav';
import { CommentsModal } from './CommentsModal';
import { DraggablePipVideo } from './DraggablePipVideo';
import { type TabKey } from '@/hooks/useAppNav';
import { useVideoFeed } from '@/hooks/useVideoFeed';
import { useVideoMutations } from '@/hooks/useVideoMutations';

interface RelaxVideoPlayerProps {
  onBackToFeed?: () => void;
  onRefresh?: () => void;
  activeTab?: TabKey;
  onTabSelect?: (key: TabKey) => void;
  onOpenCreate?: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const RelaxVideoPlayer: React.FC<RelaxVideoPlayerProps> = ({ 
  onBackToFeed,
  onRefresh = () => {},
  activeTab = "home",
  onTabSelect = () => {},
  onOpenCreate = () => {}
}) => {
  // Fetch videos from database
  const { videos: relaxVideos, loading: videosLoading, hasMore, loadMore, refetch } = useVideoFeed();
  const { toggleLike, toggleSave, incrementShare } = useVideoMutations();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [followStates, setFollowStates] = useState<Record<string, 'visible' | 'checked' | 'hidden'>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [pipVideoIndex, setPipVideoIndex] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const { triggerHaptic } = useHapticFeedback();

  const videoHeight = window.innerHeight - 50; // Account for 50px footer navbar

  // Register video elements and handle their lifecycle
  const registerVideo = useCallback((videoId: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(videoId, element);
      
      // Set video properties
      const videoIndex = relaxVideos.findIndex(v => v.id === videoId);
      const video = relaxVideos[videoIndex];
      if (video && element.src !== video.url) {
        element.src = video.url;
        element.muted = isMuted;
        element.preload = Math.abs(videoIndex - currentIndex) <= 1 ? 'auto' : 'metadata';
        
        // Add event listeners for loading states
        const handleLoadStart = () => setIsLoading(prev => ({ ...prev, [videoId]: true }));
        const handleCanPlay = () => setIsLoading(prev => ({ ...prev, [videoId]: false }));
        const handleWaiting = () => setIsLoading(prev => ({ ...prev, [videoId]: true }));
        const handlePlaying = () => setIsLoading(prev => ({ ...prev, [videoId]: false }));
        
        element.addEventListener('loadstart', handleLoadStart);
        element.addEventListener('canplay', handleCanPlay);
        element.addEventListener('waiting', handleWaiting);
        element.addEventListener('playing', handlePlaying);
        
        // Store cleanup function
        element.dataset.cleanup = 'true';
      }
    } else {
      videoRefs.current.delete(videoId);
    }
  }, [relaxVideos, currentIndex, isMuted]);

  // Handle video playback state changes
  useEffect(() => {
    const currentVideo = relaxVideos[currentIndex];
    if (!currentVideo) return;

    videoRefs.current.forEach((video, videoId) => {
      if (videoId === currentVideo.id) {
        // Play current video
        video.currentTime = 0; // Reset to beginning
        video.play().catch(() => {
          console.log('Auto-play prevented for video', videoId);
        });
      } else {
        // Pause other videos
        video.pause();
      }
    });
  }, [currentIndex, relaxVideos]);

  // Handle mute/unmute for all videos
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      video.muted = isMuted;
    });
  }, [isMuted]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, [isTransitioning]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isTransitioning) return;

    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchEndY - touchStartY.current;
    const deltaTime = touchEndTime - touchStartTime.current;
    const velocity = Math.abs(deltaY) / deltaTime;

    // Pull-to-refresh at the top
    if (currentIndex === 0 && deltaY > 120 && velocity > 0.5) {
      onRefresh();
      return;
    }

    // Navigate between videos
    if (Math.abs(deltaY) > 80 && velocity > 0.4 && deltaTime < 500) {
      setIsTransitioning(true);
      
      if (deltaY < 0 && currentIndex < relaxVideos.length - 1) {
        // Swipe up - next video
        setCurrentIndex(prev => prev + 1);
        
        // Load more if near the end
        if (currentIndex >= relaxVideos.length - 3 && hasMore) {
          loadMore();
        }
      } else if (deltaY > 0 && currentIndex > 0) {
        // Swipe down - previous video
        setCurrentIndex(prev => prev - 1);
      }
      
      // Reset transition state
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, relaxVideos.length, onRefresh, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setIsTransitioning(true);
            setCurrentIndex(prev => prev - 1);
            setTimeout(() => setIsTransitioning(false), 300);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < relaxVideos.length - 1) {
            setIsTransitioning(true);
            setCurrentIndex(prev => prev + 1);
            setTimeout(() => setIsTransitioning(false), 300);
          }
          break;
        case 'Escape':
          if (onBackToFeed) onBackToFeed();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, relaxVideos.length, isTransitioning, onBackToFeed]);

  const handleFollow = useCallback((userId: string) => {
    const currentState = followStates[userId] || 'visible';
    if (currentState === 'visible') {
      setFollowStates(prev => ({ ...prev, [userId]: 'checked' }));
      setFollowedUsers(prev => new Set([...prev, userId]));
      setTimeout(() => {
        setFollowStates(prev => ({ ...prev, [userId]: 'hidden' }));
      }, 1500);
      triggerHaptic('success');
    }
  }, [followStates, triggerHaptic]);

  // Action handlers
  const handleLike = useCallback(async (videoId: string) => {
    // Optimistic update
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
    triggerHaptic('light');
    
    // Database update
    await toggleLike(videoId);
  }, [triggerHaptic, toggleLike]);

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
    triggerHaptic('light');
  }, [isMuted, triggerHaptic]);

  const handleAction = useCallback(async (action: string, videoId?: string) => {
    console.log(`${action} action triggered`);
    triggerHaptic('light');
    
    if (action === 'save' && videoId) {
      await toggleSave(videoId);
    } else if (action === 'share' && videoId) {
      await incrementShare(videoId);
      // Trigger native share if available
      if (navigator.share) {
        navigator.share({
          title: relaxVideos.find(v => v.id === videoId)?.title,
          url: window.location.href
        });
      }
    }
  }, [triggerHaptic, toggleSave, incrementShare, relaxVideos]);

  const toggleCaptionExpansion = useCallback((videoId: string) => {
    setExpandedCaptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
    triggerHaptic('light');
  }, [triggerHaptic]);

  const needsReadMore = useCallback((text: string) => {
    // More aggressive check - trigger read more for descriptions longer than 100 characters
    return text.length > 100;
  }, []);

  // Calculate which videos to render (current + adjacent for smooth scrolling)
  const getVisibleVideos = () => {
    const visible = [];
    for (let i = Math.max(0, currentIndex - 1); i <= Math.min(relaxVideos.length - 1, currentIndex + 1); i++) {
      visible.push(i);
    }
    return visible;
  };

  const visibleVideoIndices = getVisibleVideos();

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video container */}
      <div 
        ref={containerRef}
        className={`relative w-full overflow-hidden transition-all duration-300 ${
          isCommentsOpen ? 'blur-[8px] brightness-[0.3]' : ''
        }`}
        style={{ 
          height: 'calc(100vh - 50px)', // Leave space for footer navbar
          touchAction: 'none' 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleVideoIndices.map((index) => {
          const video = relaxVideos[index];
          const translateY = (index - currentIndex) * videoHeight;
          const isActive = index === currentIndex;
          const isLiked = video.liked || likedVideos.has(video.id);
          const videoIsLoading = isLoading[video.id] || false;
          
          return (
            <div
              key={`relax-video-${index}-${video.id}`}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translateY(${translateY}px)`,
                transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                willChange: 'transform',
                zIndex: isActive ? 20 : 10
              }}
            >
              {/* Video element */}
              <video
                ref={(el) => registerVideo(video.id, el)}
                className="w-full h-full object-cover"
                poster={video.thumbnail}
                loop
                playsInline
                muted={isMuted}
              />

              {/* Enhanced loading indicator */}
              {videoIsLoading && isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-radial from-black/30 via-black/20 to-transparent">
                  <div className="relative">
                    {/* Outer pulsing ring */}
                    <div className="absolute inset-0 w-12 h-12 border-2 border-white/30 rounded-full animate-pulse" />
                    {/* Spinning loader */}
                    <div className="w-8 h-8 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    {/* Inner dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Video info overlay - only for active video */}
              {isActive && (
                <>
                  {(() => {
                    const isExpanded = expandedCaptions.has(video.id);
                    const showReadMore = needsReadMore(video.description);
                    
                    return (
                      <div 
                        className="absolute left-4 right-20 text-white z-20 transition-all duration-300 ease-out"
                        style={{ 
                          bottom: '8px',
                          transform: isExpanded ? 'translateY(-20px)' : 'translateY(0)'
                        }}
                      >
                        {/* User info - pushes up when caption expands */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <div 
                              className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold overflow-hidden"
                              style={{ backgroundColor: video.user.avatarColor }}
                            >
                              {video.user.avatar ? (
                                <img src={video.user.avatar} alt={video.user.name} className="w-full h-full object-cover" />
                              ) : (
                                video.user.initials
                              )}
                            </div>
                            {/* Follow button */}
                            {(followStates[video.user.name] || 'visible') !== 'hidden' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFollow(video.user.name);
                                }}
                                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 z-10"
                                aria-label={`Follow ${video.user.name}`}
                              >
                                {(followStates[video.user.name] || 'visible') === 'visible' ? (
                                  <Plus className="w-2.5 h-2.5 text-primary" />
                                ) : (
                                  <Check className="w-2.5 h-2.5 text-green-500" />
                                )}
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{video.user.name}</p>
                            <p className="text-xs opacity-80">@{video.user.name.toLowerCase().replace(/\s+/g, "")}</p>
                          </div>
                        </div>
                        
                        {/* Caption with expandable functionality */}
                        <div className="mb-1">
                          {!isExpanded ? (
                            /* Collapsed state - 2 lines with Read More button */
                            <div className="text-sm leading-relaxed">
                              <p className="line-clamp-2 mb-1">
                                {video.description}
                              </p>
                              {showReadMore && (
                                <button
                                  onClick={() => toggleCaptionExpansion(video.id)}
                                  className="text-white font-bold text-sm hover:text-gray-200 transition-colors"
                                >
                                  Read More
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Expanded state - full text with hashtags */
                            <div>
                              <p 
                                className="text-sm leading-relaxed cursor-pointer transition-all duration-300"
                                onClick={() => toggleCaptionExpansion(video.id)}
                              >
                                {video.description}
                              </p>
                              
                              {/* Hashtags - only show when expanded */}
                              {video.tags && video.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {video.tags.map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex} 
                                      className="text-xs text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-1 shadow-sm"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action buttons - positioned at bottom edge */}
                  <div className="absolute right-2 flex flex-col items-center gap-3 z-20" style={{ bottom: '8px', maxWidth: '48px' }}>
                    {/* Like button with enhanced styling */}
                    <button 
                      onClick={() => handleLike(video.id)}
                      className="group flex flex-col items-center gap-1 transition-all duration-200"
                    >
                      <div className={cn(
                        "relative w-10 h-10 rounded-full backdrop-blur-md border transition-all duration-200 flex items-center justify-center group-active:scale-95 shadow-lg",
                        isLiked 
                          ? "bg-red-500/20 border-red-500/30 shadow-red-500/25" 
                          : "bg-white/15 border-white/20 hover:bg-white/25"
                      )}>
                        <Heart 
                          className={cn(
                            "w-6 h-6 transition-all duration-200",
                            isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white"
                          )}
                        />
                        {/* Enhanced like animation */}
                        {isLiked && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
                          </>
                        )}
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow-sm">
                        {formatCount(video.stats.likes + (isLiked ? 1 : 0))}
                      </span>
                    </button>

                    <button 
                      onClick={() => {
                        setIsCommentsOpen(true);
                        setPipVideoIndex(video.id);
                        triggerHaptic('light');
                      }}
                      className="group flex flex-col items-center gap-1 transition-all duration-200 active:bg-transparent"
                    >
                       <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-active:scale-95 hover:bg-white/25 transition-all duration-200 shadow-lg active:bg-white/15">
                        <MessageCircle className="w-6 h-6 text-white group-active:text-primary transition-colors" />
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow-sm">
                        {formatCount(video.stats.comments)}
                      </span>
                    </button>

                    {/* Share button with enhanced styling */}
                    <button 
                      onClick={() => handleAction('share', video.id)}
                      className="group flex flex-col items-center gap-1 transition-all duration-200 active:bg-transparent"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-active:scale-95 hover:bg-white/25 transition-all duration-200 shadow-lg active:bg-white/15">
                        <Share className="w-6 h-6 text-white group-active:text-primary transition-colors" />
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow-sm">
                        {formatCount(video.stats.shares)}
                      </span>
                    </button>

                    {/* Bookmark button with enhanced styling */}
                    <button 
                      onClick={() => handleAction('save', video.id)}
                      className="group flex flex-col items-center gap-1 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-active:scale-95 hover:bg-white/25 transition-all duration-200 shadow-lg">
                        <Bookmark className="w-6 h-6 text-white" />
                      </div>
                    </button>

                    {/* Music/Mute button with enhanced styling */}
                    <button 
                      onClick={handleMute}
                      className={cn(
                        "w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center active:scale-95 transition-all duration-200 shadow-lg",
                        isMuted 
                          ? "bg-white/15 border-white/20 hover:bg-white/25" 
                          : "bg-blue-500/20 border-blue-500/30 shadow-blue-500/25"
                      )}
                    >
                      <Music className={cn(
                        "w-6 h-6 transition-colors duration-200",
                        isMuted ? "text-white" : "text-blue-400"
                      )} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      
      {/* Footer navbar for video mode */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <FooterNav
          active={activeTab}
          onSelect={onTabSelect}
          onOpenCreate={onOpenCreate}
          videoMode={true}
        />
      </div>

      {/* Comments Modal */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-[100]">
          <CommentsModal
            isOpen={isCommentsOpen}
            onClose={() => {
              setIsCommentsOpen(false);
              setPipVideoIndex(null);
            }}
            videoId={relaxVideos[currentIndex]?.id || ''}
            videoTitle={relaxVideos[currentIndex]?.title || relaxVideos[currentIndex]?.description || ''}
            totalComments={relaxVideos[currentIndex]?.stats.comments || 0}
          />
        </div>
      )}

      {/* PIP Video when comments are open */}
      {isCommentsOpen && pipVideoIndex !== null && (() => {
        const pipVideo = relaxVideos.find(v => v.id === pipVideoIndex);
        if (!pipVideo) return null;
        return (
          <DraggablePipVideo
            videoSrc={pipVideo.url}
            isPlaying={true}
            isMuted={isMuted}
            onMuteToggle={handleMute}
            onRestore={() => {
              setIsCommentsOpen(false);
              setPipVideoIndex(null);
            }}
            title={pipVideo.user.name}
          />
        );
      })()}
    </div>
  );
};
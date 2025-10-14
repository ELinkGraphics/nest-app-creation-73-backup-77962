import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, MessageCircle } from 'lucide-react';
import { Story } from '@/data/mock';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useVisibilityHandler } from '@/hooks/useVisibilityHandler';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  initialIndex, 
  isOpen, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next');
  const [nextStoryIndex, setNextStoryIndex] = useState<number | null>(null);
  const [isImagePreloaded, setIsImagePreloaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [message, setMessage] = useState('');

  const { triggerHaptic } = useHapticFeedback();
  const STORY_DURATION = 5000; // 5 seconds

  const currentStory = stories[currentIndex];
  const nextStory = nextStoryIndex !== null ? stories[nextStoryIndex] : null;

  // Preload image helper
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Still resolve on error to not block transition
      img.src = src;
    });
  }, []);

  // Get unique users and group stories by user
  const getUniqueUsers = () => {
    const userMap = new Map();
    stories.forEach((story, index) => {
      if (!userMap.has(story.user.name)) {
        userMap.set(story.user.name, []);
      }
      userMap.get(story.user.name).push({ ...story, originalIndex: index });
    });
    return Array.from(userMap.values());
  };

  const userGroups = getUniqueUsers();
  
  // Find current user group and story index within that group
  const getCurrentUserContext = () => {
    for (let userIndex = 0; userIndex < userGroups.length; userIndex++) {
      const userStories = userGroups[userIndex];
      const storyIndex = userStories.findIndex(story => story.originalIndex === currentIndex);
      if (storyIndex !== -1) {
        return { userIndex, storyIndex, userStories };
      }
    }
    return { userIndex: 0, storyIndex: 0, userStories: userGroups[0] || [] };
  };

  const goToNext = useCallback(async () => {
    const { userIndex, storyIndex, userStories } = getCurrentUserContext();
    
    // If there's a next story in the current user's stories
    if (storyIndex < userStories.length - 1) {
      const nextStoryIndex = userStories[storyIndex + 1].originalIndex;
      setCurrentIndex(nextStoryIndex);
      setProgress(0);
      triggerHaptic('light');
    } 
    // If this is the last story for current user, move to next user
    else if (userIndex < userGroups.length - 1) {
      const nextUserFirstStoryIndex = userGroups[userIndex + 1][0].originalIndex;
      const nextStoryImage = stories[nextUserFirstStoryIndex].image;
      
      setIsTransitioning(true);
      setTransitionDirection('next');
      setNextStoryIndex(nextUserFirstStoryIndex);
      setIsImagePreloaded(false);
      triggerHaptic('medium');
      
      // Preload the next story image
      try {
        await preloadImage(nextStoryImage);
        setIsImagePreloaded(true);
        
        // Wait a bit for the crossfade to be visible, then complete transition
        setTimeout(() => {
          setCurrentIndex(nextUserFirstStoryIndex);
          setProgress(0);
          
          // Clean up transition state
          setTimeout(() => {
            setIsTransitioning(false);
            setNextStoryIndex(null);
            setIsImagePreloaded(false);
          }, 100);
        }, 200);
      } catch (error) {
        // Fallback: complete transition even if preload fails
        setIsImagePreloaded(true);
        setTimeout(() => {
          setCurrentIndex(nextUserFirstStoryIndex);
          setProgress(0);
          setTimeout(() => {
            setIsTransitioning(false);
            setNextStoryIndex(null);
            setIsImagePreloaded(false);
          }, 100);
        }, 200);
      }
    } 
    // If this is the last story overall, close viewer
    else {
      onClose();
    }
  }, [currentIndex, stories, userGroups, onClose, triggerHaptic, preloadImage]);

  const goToPrevious = useCallback(async () => {
    const { userIndex, storyIndex, userStories } = getCurrentUserContext();
    
    // If there's a previous story in the current user's stories
    if (storyIndex > 0) {
      const prevStoryIndex = userStories[storyIndex - 1].originalIndex;
      setCurrentIndex(prevStoryIndex);
      setProgress(0);
      triggerHaptic('light');
    } 
    // If this is the first story for current user, move to previous user's last story
    else if (userIndex > 0) {
      const prevUserStories = userGroups[userIndex - 1];
      const prevUserLastStoryIndex = prevUserStories[prevUserStories.length - 1].originalIndex;
      const prevStoryImage = stories[prevUserLastStoryIndex].image;
      
      setIsTransitioning(true);
      setTransitionDirection('prev');
      setNextStoryIndex(prevUserLastStoryIndex);
      setIsImagePreloaded(false);
      triggerHaptic('medium');
      
      // Preload the previous story image
      try {
        await preloadImage(prevStoryImage);
        setIsImagePreloaded(true);
        
        // Wait a bit for the crossfade to be visible, then complete transition
        setTimeout(() => {
          setCurrentIndex(prevUserLastStoryIndex);
          setProgress(0);
          
          // Clean up transition state
          setTimeout(() => {
            setIsTransitioning(false);
            setNextStoryIndex(null);
            setIsImagePreloaded(false);
          }, 100);
        }, 200);
      } catch (error) {
        // Fallback: complete transition even if preload fails
        setIsImagePreloaded(true);
        setTimeout(() => {
          setCurrentIndex(prevUserLastStoryIndex);
          setProgress(0);
          setTimeout(() => {
            setIsTransitioning(false);
            setNextStoryIndex(null);
            setIsImagePreloaded(false);
          }, 100);
        }, 200);
      }
    }
  }, [currentIndex, stories, userGroups, triggerHaptic, preloadImage]);

  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrevious,
  });

  // Handle visibility changes (tab switching, etc.)
  useVisibilityHandler({
    onVisibilityChange: (isVisible) => {
      setIsPaused(!isVisible);
    },
  });

  useEffect(() => {
    if (!isOpen || isPaused || isTransitioning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, isTransitioning, goToNext]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsTransitioning(false);
    setNextStoryIndex(null);
    setIsImagePreloaded(false);
  }, [initialIndex, isOpen]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    triggerHaptic('light');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      {/* Progress bars - only show current user's stories */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {(() => {
          const { userStories, storyIndex } = getCurrentUserContext();
          return userStories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < storyIndex ? '100%' : 
                         index === storyIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ));
        })()}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close story"
      >
        <X className="size-6" />
      </button>


      {/* Story content */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        {...swipeHandlers}
      >
        {/* Current story */}
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isTransitioning && isImagePreloaded
            ? 'opacity-0 scale-[0.98]'
            : 'opacity-100 scale-100'
        }`}>
          <img
            src={currentStory.image}
            alt={`${currentStory.user.name}'s story`}
            className="w-full h-full object-cover"
            onLoad={() => {
              if (!isTransitioning) {
                setProgress(0);
              }
            }}
            draggable={false}
          />
        </div>

        {/* Next story (for crossfade transition) */}
        {isTransitioning && nextStory && (
          <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            isImagePreloaded
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-[1.02]'
          }`}>
            <img
              src={nextStory.image}
              alt={`${nextStory.user.name}'s story`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        )}
        
        {/* User info */}
        <div className="absolute bottom-20 left-4 right-4 text-white z-10">
          <div className="flex items-center gap-3">
            <div 
              className="size-10 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden"
              style={{ backgroundColor: currentStory.user.avatarColor }}
            >
              {currentStory.user.avatar ? (
                <img src={currentStory.user.avatar} alt={currentStory.user.name} className="w-full h-full object-cover" />
              ) : (
                currentStory.user.initials
              )}
            </div>
            <div>
              <p className="font-medium">{currentStory.user.name}</p>
              <p className="text-sm text-white/80">
                {(() => {
                  const { storyIndex, userStories } = getCurrentUserContext();
                  return `${storyIndex + 1} of ${userStories.length}`;
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Like, Comment and Message input */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2">
          {/* Like button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
            aria-label={isLiked ? "Unlike story" : "Like story"}
          >
            <Heart 
              className={`size-6 transition-all ${
                isLiked 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-white'
              }`}
            />
          </button>

          {/* Comment button */}
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
            aria-label="Comment on story"
          >
            <MessageCircle className="size-6 text-white" />
          </button>

          {/* Message input */}
          <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message..."
              className="flex-1 bg-transparent text-white placeholder:text-white/60 outline-none text-sm"
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            />
            {message && (
              <button
                onClick={() => {
                  // TODO: Implement send message functionality
                  setMessage('');
                }}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Send message"
              >
                <Send className="size-5" />
              </button>
            )}
          </div>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/20 rounded-full p-4">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Tap zones for navigation */}
      <div className="absolute inset-0 flex z-20">
        <div 
          className="flex-1 cursor-pointer"
          onClick={goToPrevious}
          aria-label="Previous story"
        />
        <div 
          className="flex-1 cursor-pointer" 
          onClick={handlePauseToggle}
          aria-label="Pause/play story"
        />
        <div 
          className="flex-1 cursor-pointer"
          onClick={goToNext}
          aria-label="Next story"
        />
      </div>
    </div>
  );
};

export default StoryViewer;
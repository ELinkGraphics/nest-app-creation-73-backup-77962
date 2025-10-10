import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Story } from '@/data/mock';
import StoryViewer from './StoryViewer';
import CreateStoryModal from './CreateStoryModal';
import { useUser } from '@/contexts/UserContext';
import { useStoryPersistence } from '@/hooks/useStoryPersistence';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const StoriesBar: React.FC = () => {
  const { user } = useUser();
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [stories, refreshStories, isLoading] = useStoryPersistence();

  const handleStoryClick = (story: Story, index: number) => {
    if (story.isOwn && (!story.allStories || story.allStories.length === 0)) {
      // If it's user's own story and they have no stories yet, open create modal
      setIsCreateStoryOpen(true);
      return;
    }
    
    setSelectedStoryIndex(index);
    setIsStoryViewerOpen(true);
  };

  const handleCreateStory = () => {
    // Refresh stories after creation
    refreshStories();
  };

  if (isLoading) {
    return null; // Or a skeleton loader
  }

  return (
    <>
      <section aria-label="Stories" className="px-4 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide" aria-live="polite">
          {stories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              onClick={() => handleStoryClick(story, index)}
              className="flex flex-col items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-xl transition-transform hover:scale-105"
              aria-label={story.isOwn && (!story.allStories || story.allStories.length === 0) ? "Add your story" : `View ${story.user.name}'s story`}
              title={story.isOwn && (!story.allStories || story.allStories.length === 0) ? "Add your story" : `View ${story.user.name}'s story`}
            >
              <div className="relative">
                <div 
                  className={`size-18 rounded-full grid place-items-center transition-opacity ${
                    story.isOwn && (!story.allStories || story.allStories.length === 0)
                      ? 'p-[3px] bg-gray-300 rounded-full' 
                      : 'p-[3px] bg-gradient-to-br from-primary via-secondary to-tertiary rounded-full'
                  }`}
                  style={
                    story.allStories && story.allStories.length > 1
                      ? {
                          background: `conic-gradient(from -90deg, 
                            ${story.allStories.map((_, i) => {
                              const segmentSize = 360 / story.allStories!.length;
                              const gapSize = 4; // Gap between segments in degrees
                              const start = (i * segmentSize);
                              const end = ((i + 1) * segmentSize) - gapSize;
                              return `hsl(var(--primary)) ${start}deg ${end}deg, transparent ${end}deg ${start + segmentSize}deg`;
                            }).join(', ')})`,
                        }
                      : undefined
                  }
                >
                  <div className="size-full rounded-full bg-background grid place-items-center p-[3px]">
                    {story.isOwn && (!story.allStories || story.allStories.length === 0) ? (
                      <div className="size-full rounded-full border border-dashed border-gray-200 grid place-items-center">
                        <Avatar className="size-12">
                          <AvatarFallback 
                            className="text-xs font-medium text-white"
                            style={{ backgroundColor: user?.avatarColor || '#E08ED1' }}
                          >
                            {user?.initials || 'YS'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <Avatar className="size-12">
                        <AvatarFallback 
                          className="text-xs font-medium text-white"
                          style={{ backgroundColor: story.user.avatarColor }}
                        >
                          {story.user.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
                {story.isOwn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateStoryOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 size-6 bg-primary rounded-full flex items-center justify-center border-2 border-white hover:bg-primary/90 transition-colors"
                    aria-label="Add story"
                  >
                    <Plus className="size-3 text-white" />
                  </button>
                )}
              </div>
              <span className="mt-2 text-xs text-gray-700 max-w-[60px] truncate text-center leading-tight">
                {story.isOwn ? "Your story" : story.user.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <StoryViewer
        stories={selectedStoryIndex >= 0 && stories[selectedStoryIndex]?.allStories 
          ? stories[selectedStoryIndex].allStories! 
          : stories.filter(story => !story.isOwn || (story.allStories && story.allStories.length > 0))}
        initialIndex={0}
        isOpen={isStoryViewerOpen}
        onClose={() => setIsStoryViewerOpen(false)}
      />
      
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onCreateStory={handleCreateStory}
      />
    </>
  );
};

export default StoriesBar;
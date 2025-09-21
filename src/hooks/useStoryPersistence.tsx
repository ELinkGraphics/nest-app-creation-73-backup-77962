import { useState, useEffect } from 'react';
import { Story } from '@/data/mock';
import { useUser } from '@/contexts/UserContext';

interface PersistedStoryData {
  userId: string;
  stories: Story[];
  timestamp: number;
}

const STORAGE_KEY = 'account_owner_stories';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useStoryPersistence = (initialStories: Story[]) => {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>(initialStories);

  // Load persisted stories for account owner on mount
  useEffect(() => {
    if (!user) return;

    try {
      const persistedData = localStorage.getItem(STORAGE_KEY);
      if (persistedData) {
        const data: PersistedStoryData = JSON.parse(persistedData);
        
        // Check if data is for current user and not expired
        if (data.userId === user.id && Date.now() - data.timestamp < CACHE_DURATION) {
          // Keep owner's stories, update others
          const ownerStories = data.stories.filter(story => story.isOwn);
          const otherStories = initialStories.filter(story => !story.isOwn);
          
          setStories([...ownerStories, ...otherStories]);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted stories:', error);
    }

    // Fallback to initial stories
    setStories(initialStories);
  }, [user, initialStories]);

  // Persist owner's stories when they change
  const updateStories = (newStories: Story[]) => {
    setStories(newStories);
    
    if (user) {
      try {
        const persistedData: PersistedStoryData = {
          userId: user.id,
          stories: newStories.filter(story => story.isOwn), // Only persist owner's stories
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
      } catch (error) {
        console.warn('Failed to persist stories:', error);
      }
    }
  };

  return [stories, updateStories] as const;
};

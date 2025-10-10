import { useState, useEffect } from 'react';
import { Story } from '@/data/mock';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

export const useStoryPersistence = () => {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stories from Supabase
  const fetchStories = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active stories (not expired) with user profile data
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          media_url,
          media_type,
          created_at,
          user_id,
          profiles:user_id (
            name,
            initials,
            avatar_color
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to Story format
      const transformedStories: Story[] = data?.map((story: any) => ({
        id: story.id,
        user: {
          name: story.profiles?.name || 'Unknown',
          initials: story.profiles?.initials || '??',
          avatarColor: story.profiles?.avatar_color || '#4B164C',
        },
        image: story.media_url,
        isOwn: story.user_id === user?.id,
      })) || [];

      // Add "Your story" button at the beginning if user is logged in
      if (user) {
        const yourStoryButton: Story = {
          id: -1, // Special ID for "Your story" button
          user: {
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor || '#E08ED1',
          },
          image: '',
          isOwn: true,
        };
        setStories([yourStoryButton, ...transformedStories]);
      } else {
        setStories(transformedStories);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      // Set "Your story" button even on error if user exists
      if (user) {
        setStories([{
          id: -1,
          user: {
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor || '#E08ED1',
          },
          image: '',
          isOwn: true,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stories on mount and when user changes
  useEffect(() => {
    fetchStories();
  }, [user]);

  // Refresh stories function
  const refreshStories = () => {
    fetchStories();
  };

  return [stories, refreshStories, isLoading] as const;
};

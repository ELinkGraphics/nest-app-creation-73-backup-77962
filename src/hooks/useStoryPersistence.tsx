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
          live_stream_id,
          profiles:user_id (
            name,
            initials,
            avatar_color,
            avatar_url
          ),
          live_streams:live_stream_id (
            id,
            status,
            title
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to Story format
      const transformedStories: Story[] = data?.map((story: any) => ({
        id: story.id,
        user: {
          id: story.user_id,
          name: story.profiles?.name || 'Unknown',
          initials: story.profiles?.initials || '??',
          avatarColor: story.profiles?.avatar_color || '#4B164C',
          avatar: story.profiles?.avatar_url,
        },
        image: story.media_url,
        isOwn: story.user_id === user?.id,
        isLive: story.live_streams?.status === 'live',
        liveStreamId: story.live_stream_id,
      })) || [];

      // Group stories by user
      const groupedStories: Story[] = [];
      const userStoriesMap = new Map<string, Story[]>();

      // Separate own stories and others' stories
      const ownStories: Story[] = [];
      const othersStories: Story[] = [];

      transformedStories.forEach(story => {
        if (story.isOwn) {
          ownStories.push(story);
        } else {
          const userId = data?.find((s: any) => s.id === story.id)?.user_id;
          if (userId) {
            if (!userStoriesMap.has(userId)) {
              userStoriesMap.set(userId, []);
            }
            userStoriesMap.get(userId)?.push(story);
          }
        }
      });

      // Add user's own story circle at the beginning if user is logged in
      if (user) {
        const yourStoryCircle: Story = {
          id: ownStories.length > 0 ? ownStories[0].id : -1,
          user: {
            id: user.id,
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor || '#E08ED1',
            avatar: user.avatar,
          },
          image: ownStories.length > 0 ? ownStories[0].image : '',
          isOwn: true,
          // Store all user's stories in a custom property
          allStories: ownStories.length > 0 ? ownStories : undefined,
        };
        groupedStories.push(yourStoryCircle);
      }

      // Add other users' story circles (first story of each user)
      userStoriesMap.forEach((stories, userId) => {
        if (stories.length > 0) {
          groupedStories.push({
            ...stories[0],
            allStories: stories,
          });
        }
      });

      setStories(groupedStories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
      // Set "Your story" button even on error if user exists
      if (user) {
        setStories([{
          id: -1,
          user: {
            id: user.id,
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor || '#E08ED1',
            avatar: user.avatar,
          },
          image: '',
          isOwn: true,
        }]);
      } else {
        setStories([]);
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

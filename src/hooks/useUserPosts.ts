import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PostData {
  id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  user_has_liked: boolean;
}

export const useUserPosts = (userId: string | undefined) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            media_url,
            created_at,
            post_stats!inner (
              likes_count,
              comments_count,
              shares_count,
              saves_count
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Check which posts the current user has liked
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;

        let likesData: any[] = [];
        if (currentUserId) {
          const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUserId)
            .in('post_id', data.map(p => p.id));
          
          likesData = likes || [];
        }

        const likedPostIds = new Set(likesData.map(l => l.post_id));

        const formattedPosts = data.map(post => ({
          id: post.id,
          content: post.content,
          media_url: post.media_url,
          created_at: post.created_at,
          likes_count: post.post_stats[0]?.likes_count || 0,
          comments_count: post.post_stats[0]?.comments_count || 0,
          shares_count: post.post_stats[0]?.shares_count || 0,
          saves_count: post.post_stats[0]?.saves_count || 0,
          user_has_liked: likedPostIds.has(post.id),
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  return { posts, isLoading, refetch: () => {} };
};

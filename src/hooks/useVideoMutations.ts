import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVideoMutations = () => {
  const toggleLike = useCallback(async (videoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to like videos');
        return;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('video_likes')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: user.id });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  }, []);

  const toggleSave = useCallback(async (videoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save videos');
        return;
      }

      // Check if already saved
      const { data: existingSave } = await supabase
        .from('video_saves')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      if (existingSave) {
        // Unsave
        await supabase
          .from('video_saves')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);
        toast.success('Video removed from saved');
      } else {
        // Save
        await supabase
          .from('video_saves')
          .insert({ video_id: videoId, user_id: user.id });
        toast.success('Video saved');
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save');
    }
  }, []);

  const addComment = useCallback(async (videoId: string, content: string, parentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to comment');
        return;
      }

      const { error } = await supabase
        .from('video_comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          content,
          parent_id: parentId || null
        });

      if (error) throw error;

      toast.success('Comment added');
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  }, []);

  const incrementShare = useCallback(async (videoId: string) => {
    try {
      // First get current count
      const { data: currentStats } = await supabase
        .from('video_stats')
        .select('shares_count')
        .eq('video_id', videoId)
        .single();

      if (currentStats) {
        await supabase
          .from('video_stats')
          .update({ shares_count: (currentStats.shares_count || 0) + 1 })
          .eq('video_id', videoId);
      }
    } catch (error: any) {
      console.error('Error incrementing share:', error);
    }
  }, []);

  const deleteVideo = useCallback(async (videoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to delete videos');
        return;
      }

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Video deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
      return false;
    }
  }, []);

  return {
    toggleLike,
    toggleSave,
    addComment,
    incrementShare,
    deleteVideo
  };
};

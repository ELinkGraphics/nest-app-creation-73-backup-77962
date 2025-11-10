import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_username: string;
  other_user_avatar: string | null;
  other_user_initials: string;
  other_user_online: boolean;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
}

export const useConversations = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .rpc('get_user_conversations', { _user_id: userId });

      if (error) throw error;
      return (data || []) as Conversation[];
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refetch conversations when any message changes
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
        },
        () => {
          // Refetch when read status changes
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    conversations: conversations || [],
    isLoading,
    error,
    refetch,
  };
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  const createConversation = async (currentUserId: string, otherUserId: string) => {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      _user1_id: currentUserId,
      _user2_id: otherUserId,
    });

    if (error) throw error;

    // Invalidate conversations query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['conversations'] });

    return data as string;
  };

  return { createConversation };
};

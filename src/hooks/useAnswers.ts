import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAnswers = (questionId: string) => {
  return useQuery({
    queryKey: ['answers', questionId],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('answers')
        .select(`
          *,
          profiles:user_id (
            username,
            name,
            avatar_url,
            initials,
            avatar_color
          )
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!questionId,
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerData: {
      questionId: string;
      content: string;
      isAnonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is an expert
      const sb = supabase as any;
      const { data: expertProfile } = await sb
        .from('expert_profiles')
        .select('is_verified')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await sb
        .from('answers')
        .insert({
          question_id: answerData.questionId,
          user_id: user.id,
          content: answerData.content,
          is_anonymous: answerData.isAnonymous ?? true,
          is_expert: expertProfile?.is_verified || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['question', variables.questionId] });
      toast.success('Answer posted successfully!');
    },
    onError: (error) => {
      console.error('Error creating answer:', error);
      toast.error('Failed to post answer');
    },
  });
};

export const useAnswerVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answerId, hasVoted, questionId }: { answerId: string; hasVoted: boolean; questionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (hasVoted) {
        const { error } = await (supabase as any)
          .from('answer_votes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('answer_votes')
          .insert({ answer_id: answerId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });
};

export const useMarkAnswerHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answerId, questionId }: { answerId: string; questionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify user is the question author
      const sb = supabase as any;
      const { data: question } = await sb
        .from('questions')
        .select('user_id')
        .eq('id', questionId)
        .single();

      if (question?.user_id !== user.id) {
        throw new Error('Only the question author can mark answers as helpful');
      }

      const { error } = await sb
        .from('answers')
        .update({ is_helpful: true })
        .eq('id', answerId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['answers', variables.questionId] });
      toast.success('Answer marked as helpful!');
    },
    onError: (error) => {
      console.error('Error marking answer as helpful:', error);
      toast.error('Failed to mark answer as helpful');
    },
  });
};

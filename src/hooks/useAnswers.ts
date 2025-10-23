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
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for non-null user_ids
      const userIds = data
        ?.filter((a: any) => a.user_id)
        .map((a: any) => a.user_id) || [];

      let profiles: any = {};
      if (userIds.length > 0) {
        const { data: profileData } = await sb
          .from('profiles')
          .select('id, username, name, avatar_url, initials, avatar_color')
          .in('id', userIds);

        profiles = (profileData || []).reduce((acc: any, p: any) => {
          acc[p.id] = p;
          return acc;
        }, {});
      }

      // Attach profile to each answer
      return data?.map((answer: any) => ({
        ...answer,
        profile: answer.user_id ? profiles[answer.user_id] : null
      }));
    },
    enabled: !!questionId,
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerData: {
      questionId: string;
      answer: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const sb = supabase as any;
      const { data, error } = await sb
        .from('answers')
        .insert({
          question_id: answerData.questionId,
          user_id: user.id,
          answer: answerData.answer,
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

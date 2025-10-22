import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuestionFilter = 'recent' | 'trending' | 'unanswered' | 'expert';

export const useQuestions = (filter: QuestionFilter = 'recent', page = 0, pageSize = 10) => {
  return useQuery({
    queryKey: ['questions', filter, page],
    queryFn: async () => {
      const sb = supabase as any;
      let query = sb
        .from('questions')
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
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Apply filters (fallback to created_at until metrics are available)
      switch (filter) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          query = query.order('created_at', { ascending: false });
          break;
        case 'unanswered':
          query = query.order('created_at', { ascending: false });
          break;
        case 'expert':
          query = query.not('ai_response', 'is', null).order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useQuestion = (questionId: string) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('questions')
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
        .eq('id', questionId)
        .single();

      if (error) throw error;
      
      // Increment view count
      await (supabase as any)
        .from('questions')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', questionId);

      return data;
    },
    enabled: !!questionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: {
      question: string;
      category: string;
      tags: string[];
      isUrgent?: boolean;
      isThread?: boolean;
      threadTitle?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const sb = supabase as any;
      const { data, error } = await sb
        .from('questions')
        .insert({
          user_id: user.id,
          question: questionData.question,
          category: questionData.category,
          tags: questionData.tags,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger AI insight generation asynchronously
      if (!questionData.isThread) {
        supabase.functions.invoke('generate-ai-insight', {
          body: {
            questionId: data.id,
            question: questionData.question,
            category: questionData.category,
          }
        }).catch(err => console.error('AI insight generation failed:', err));
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('Question posted successfully!');
    },
    onError: (error) => {
      console.error('Error creating question:', error);
      toast.error('Failed to post question');
    },
  });
};

export const useQuestionVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, hasVoted }: { questionId: string; hasVoted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (hasVoted) {
        // Remove vote
        const { error } = await (supabase as any)
          .from('question_votes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add vote
        const { error } = await (supabase as any)
          .from('question_votes')
          .insert({ question_id: questionId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });
};

export const useUserVotes = () => {
  return useQuery({
    queryKey: ['userVotes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { questions: [], answers: [], threadUpdates: [] };

      const [questions, answers, threadUpdates] = await Promise.all([
        (supabase as any)
          .from('question_votes')
          .select('question_id')
          .eq('user_id', user.id),
        (supabase as any)
          .from('answer_votes')
          .select('answer_id')
          .eq('user_id', user.id),
        (supabase as any)
          .from('thread_update_votes')
          .select('thread_update_id')
          .eq('user_id', user.id),
      ]);

      return {
        questions: questions.data?.map(v => v.question_id) || [],
        answers: answers.data?.map(v => v.answer_id) || [],
        threadUpdates: threadUpdates.data?.map(v => v.thread_update_id) || [],
      };
    },
  });
};

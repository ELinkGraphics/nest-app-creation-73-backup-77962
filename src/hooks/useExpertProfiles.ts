import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useExpertProfiles = () => {
  return useQuery({
    queryKey: ['expertProfiles'],
    queryFn: async () => {
      const sb = supabase as any;
      const { data, error } = await sb
        .from('expert_profiles')
        .select(`
          *,
          profiles:user_id (
            username,
            name,
            avatar_url,
            initials,
            avatar_color
          ),
          featured_answer:featured_answer_id (
            id,
            content,
            question_id,
            questions (
              question
            )
          )
        `)
        .eq('is_verified', true)
        .limit(5);

      if (error) throw error;
      return data;
    },
  });
};

export const useIsExpert = () => {
  return useQuery({
    queryKey: ['isExpert'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const sb = supabase as any;
      const { data } = await sb
        .from('expert_profiles')
        .select('is_verified')
        .eq('user_id', user.id)
        .single();

      return data?.is_verified || false;
    },
  });
};

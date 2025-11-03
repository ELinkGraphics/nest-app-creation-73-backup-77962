import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentHelperActivity = (userId?: string) => {
  return useQuery({
    queryKey: ['helper-recent-activity', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('sos_helpers')
        .select(`
          id,
          status,
          completed_at,
          alert_id,
          sos_alerts:alert_id (
            sos_type,
            description,
            location_address,
            urgency
          )
        `)
        .eq('helper_user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map((activity: any) => ({
        id: activity.id,
        action: `Helped with ${activity.sos_alerts?.sos_type || 'emergency'}`,
        time: activity.completed_at,
        location: activity.sos_alerts?.location_address || 'Location unavailable',
        type: activity.sos_alerts?.sos_type || 'other',
        urgency: activity.sos_alerts?.urgency || 'medium',
      }));
    },
    enabled: !!userId,
  });
};

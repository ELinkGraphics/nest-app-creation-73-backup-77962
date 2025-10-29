import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HelperResponse {
  alert_id: string;
  estimated_arrival_minutes?: number;
  current_lat?: number;
  current_lng?: number;
}

export const useSOSHelpers = (alertId?: string) => {
  const queryClient = useQueryClient();

  const { data: helpers, isLoading } = useQuery({
    queryKey: ['sos-helpers', alertId],
    queryFn: async () => {
      if (!alertId) return [];

      const { data, error } = await supabase
        .from('sos_helpers')
        .select(`
          *,
          profiles:helper_user_id (full_name, avatar_url)
        `)
        .eq('alert_id', alertId)
        .order('accepted_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!alertId,
  });

  const respondToAlert = useMutation({
    mutationFn: async (data: HelperResponse) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data: helper, error } = await supabase
        .from('sos_helpers')
        .insert({
          alert_id: data.alert_id,
          helper_user_id: user.id,
          estimated_arrival_minutes: data.estimated_arrival_minutes,
          current_lat: data.current_lat,
          current_lng: data.current_lng,
        })
        .select()
        .single();

      if (error) throw error;
      return helper;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos-helpers'] });
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
      toast.success('Response sent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to respond: ${error.message}`);
    },
  });

  const updateHelperLocation = useMutation({
    mutationFn: async ({ 
      helperId, 
      lat, 
      lng 
    }: { 
      helperId: string; 
      lat: number; 
      lng: number;
    }) => {
      const { data, error } = await supabase
        .from('sos_helpers')
        .update({
          current_lat: lat,
          current_lng: lng,
        })
        .eq('id', helperId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const completeHelp = useMutation({
    mutationFn: async (helperId: string) => {
      const { data, error } = await supabase
        .from('sos_helpers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', helperId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos-helpers'] });
      toast.success('Help marked as completed');
    },
  });

  // Set up realtime subscription for helpers
  useEffect(() => {
    const channel = supabase
      .channel('sos_helpers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_helpers',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sos-helpers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    helpers: helpers || [],
    isLoading,
    respondToAlert,
    updateHelperLocation,
    completeHelp,
  };
};

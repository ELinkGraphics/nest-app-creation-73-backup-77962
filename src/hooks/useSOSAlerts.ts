import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SOSAlert {
  id: string;
  user_id: string;
  sos_type: string;
  sub_category: string | null;
  urgency: string;
  description: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  share_live_location: boolean;
  photo_urls: string[] | null;
  created_at: string;
  distance?: number;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface CreateSOSAlertData {
  sos_type: string;
  sub_category?: string;
  urgency: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  share_live_location?: boolean;
  photo_urls?: string[];
  person_age?: string;
  person_description?: string;
  last_seen?: string;
  injury_type?: string;
  conscious_level?: string;
  threat_active?: boolean;
}

export const useSOSAlerts = (userLat?: number | null, userLng?: number | null) => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['sos-alerts', userLat, userLng],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .in('status', ['active', 'responding'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate distances if user location is available
      if (userLat && userLng) {
        return data.map((alert: any) => {
          if (alert.location_lat && alert.location_lng) {
            const distance = calculateDistance(
              userLat,
              userLng,
              alert.location_lat,
              alert.location_lng
            );
            return { ...alert, distance };
          }
          return alert;
        });
      }

      return data;
    },
    enabled: true,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const createAlert = useMutation({
    mutationFn: async (data: CreateSOSAlertData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data: alert, error } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
      toast.success('SOS alert created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create alert: ${error.message}`);
    },
  });

  const updateAlertStatus = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const { data, error } = await supabase
        .from('sos_alerts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
    },
  });

  return {
    alerts: alerts || [],
    isLoading,
    error,
    createAlert,
    updateAlertStatus,
  };
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Subscribe to realtime updates
export const useSOSRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('sos_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

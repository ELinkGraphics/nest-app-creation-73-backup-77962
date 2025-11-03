import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
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
    name: string;
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
        .select('*')
        .in('status', ['active', 'responding'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles and helper count for each alert
      const alertsWithProfiles = await Promise.all(
        data.map(async (alert: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', alert.user_id)
            .single();
          
          // Get helper count for this alert
          const { count: helperCount } = await supabase
            .from('sos_helpers')
            .select('*', { count: 'exact', head: true })
            .eq('alert_id', alert.id)
            .in('status', ['responding', 'arrived']);
          
          let alertWithProfile = { 
            ...alert, 
            profiles: profile,
            helper_count: helperCount || 0
          };
          
          // Calculate distance if user location is available
          if (userLat && userLng && alert.location_lat && alert.location_lng) {
            const distance = calculateDistance(
              userLat,
              userLng,
              alert.location_lat,
              alert.location_lng
            );
            alertWithProfile = { ...alertWithProfile, distance };
          }
          
          return alertWithProfile;
        })
      );

      return alertsWithProfiles;
    },
    enabled: true,
    refetchInterval: 30000, // Refetch every 30 seconds as backup (realtime is primary)
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

  // Real-time subscription for alerts with in-app notifications
  useEffect(() => {
    const channel = supabase
      .channel('sos-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_alerts',
        },
        (payload) => {
          console.log('SOS Alert change:', payload);
          queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
          
          // Show in-app and browser notification for new alerts
          if (payload.eventType === 'INSERT' && payload.new) {
            const alert = payload.new as any;
            toast.info(`New ${alert.sos_type} alert nearby`, {
              description: alert.description?.substring(0, 50) + '...'
            });
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(`🚨 New ${alert.sos_type} Alert`, {
                body: alert.description?.substring(0, 100) || 'Emergency assistance needed',
                icon: '/icon-192.png',
                tag: alert.id,
                requireInteraction: true,
              });
            }
          }
          
          // Show notification for status changes
          if (payload.eventType === 'UPDATE' && payload.new) {
            const alert = payload.new as any;
            if (alert.status === 'responding') {
              toast.success('Helper is responding to alert');
              if (Notification.permission === 'granted') {
                new Notification('Helper Responding', {
                  body: 'A helper is on the way to your emergency',
                  icon: '/icon-192.png',
                });
              }
            } else if (alert.status === 'resolved') {
              toast.success('Alert has been resolved');
              if (Notification.permission === 'granted') {
                new Notification('Emergency Resolved', {
                  body: 'Your emergency alert has been resolved',
                  icon: '/icon-192.png',
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Real-time subscription for helper responses
  useEffect(() => {
    const channel = supabase
      .channel('sos-helpers-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sos_helpers',
        },
        (payload) => {
          console.log('New helper response:', payload);
          queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['sos-helpers'] });
          
          toast.success('A helper is responding to your alert!');
          
          // Send push notification to alert creator
          if (payload.new) {
            const helperResponse = payload.new as any;
            supabase.functions.invoke('send-push-notification', {
              body: {
                userId: helperResponse.alert_id, // Will be mapped to alert creator
                title: '🆘 Helper Responding',
                body: 'A helper is on the way to assist you',
                notificationType: 'helper_response',
                data: {
                  alertId: helperResponse.alert_id,
                },
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Location tracking for live location sharing
  const updateAlertLocation = useCallback(async (alertId: string, lat: number, lng: number) => {
    const { error } = await supabase
      .from('sos_alerts')
      .update({
        location_lat: lat,
        location_lng: lng,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error updating alert location:', error);
    }
  }, []);

  return {
    alerts: alerts || [],
    isLoading,
    error,
    createAlert,
    updateAlertStatus,
    updateAlertLocation,
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


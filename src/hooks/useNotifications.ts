import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Fetch user's notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['push-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('push_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-notifications'] });
    },
  });

  // Real-time subscription for new notifications
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const channel = supabase
          .channel('notifications-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'push_notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              console.log('New notification received:', payload);
              queryClient.invalidateQueries({ queryKey: ['push-notifications'] });
              
              const notification = payload.new as any;
              
              // Show browser notification
              if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                  body: notification.body,
                  icon: '/icon-192.png',
                  tag: notification.id,
                  data: notification.data,
                });
              }
              
              // Show toast
              toast.info(notification.title, {
                description: notification.body,
              });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  return {
    notifications: notifications || [],
    isLoading,
    unreadCount,
    markAsRead,
  };
};

import React, { useState } from 'react';
import { ArrowLeft, Check, Trash2, Shield, Heart, MessageCircle, UserPlus, ShoppingBag, Calendar, Gift, AlertCircle, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import FooterNav from '@/components/FooterNav';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications: dbNotifications, isLoading, unreadCount, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user profiles for notifications
  const { data: profiles } = useQuery({
    queryKey: ['notification-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, initials, avatar_color');
      return data || [];
    },
  });

  const getProfileById = (userId: string) => {
    return profiles?.find(p => p.id === userId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'follow': return UserPlus;
      case 'sos_alert': 
      case 'helper_response':
      case 'emergency_contact':
        return Shield;
      case 'live_start': return Video;
      case 'order': return ShoppingBag;
      case 'event': return Calendar;
      case 'reward': return Gift;
      default: return MessageCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      case 'follow': return 'bg-green-100 text-green-600';
      case 'sos_alert':
      case 'helper_response':
      case 'emergency_contact':
        return 'bg-red-100 text-red-600';
      case 'live_start': return 'bg-purple-100 text-purple-600';
      case 'order': return 'bg-green-100 text-green-600';
      case 'event': return 'bg-orange-100 text-orange-600';
      case 'reward': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isSafetyNotification = (type: string) => {
    return ['sos_alert', 'helper_response', 'emergency_contact', 'alert_update'].includes(type);
  };

  const isSocialNotification = (type: string) => {
    return ['like', 'comment', 'follow', 'mention'].includes(type);
  };

  const safetyNotifications = dbNotifications.filter(n => isSafetyNotification(n.notification_type));
  const socialNotifications = dbNotifications.filter(n => isSocialNotification(n.notification_type));

  const markAllAsRead = async () => {
    const unreadIds = dbNotifications.filter(n => !n.read_at).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead.mutateAsync(id);
    }
  };

  const deleteNotification = async (id: string) => {
    await supabase
      .from('push_notifications')
      .delete()
      .eq('id', id);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return dbNotifications.filter(n => !n.read_at);
      case 'safety':
        return safetyNotifications;
      case 'social':
        return socialNotifications;
      default:
        return dbNotifications;
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = getNotificationIcon(notification.notification_type);
    const profile = notification.data?.userId ? getProfileById(notification.data.userId) : null;
    const isUnread = !notification.read_at;
    const isSafety = isSafetyNotification(notification.notification_type);
    
    return (
      <div 
        className={`px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${
          isUnread ? 'bg-primary/5 border-l-2 border-l-primary' : ''
        }`}
        onClick={() => !isUnread && markAsRead.mutate(notification.id)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {profile ? (
              <Avatar className="size-9">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback 
                  className="text-xs font-medium text-white"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={`p-2 rounded-full shadow-sm ${getNotificationColor(notification.notification_type)}`}>
                <Icon className="size-4" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="font-semibold text-xs text-foreground truncate">{notification.title}</h3>
                {isUnread && (
                  <div className="size-1.5 bg-primary rounded-full flex-shrink-0" />
                )}
                {isSafety && (
                  <Badge variant="destructive" className="text-[10px] px-1 py-0 flex-shrink-0">Urgent</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
              >
                <Trash2 className="size-2.5" />
              </Button>
            </div>
            
            <p className="text-muted-foreground text-xs truncate mb-1.5 leading-relaxed">{notification.body}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="notifications-page">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="size-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-[73px] bg-background border-b border-border">
          <TabsList className="w-full h-12 bg-transparent justify-start rounded-none p-0">
            <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              All ({dbNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="safety" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Safety ({safetyNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Social ({socialNotifications.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="divide-y divide-border">
            {getFilteredNotifications().map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <div className="divide-y divide-border">
            {getFilteredNotifications().map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safety" className="mt-0">
          <div className="divide-y divide-border">
            {getFilteredNotifications().map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-0">
          <div className="divide-y divide-border">
            {getFilteredNotifications().map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {getFilteredNotifications().length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Check className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      )}

      <FooterNav 
        active="home"
        onSelect={() => {}} // Navigation handled by FooterNav directly
        onOpenCreate={() => {}}
      />
    </div>
  );
};

export default Notifications;
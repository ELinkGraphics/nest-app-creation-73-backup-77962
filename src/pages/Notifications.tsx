import React, { useState } from 'react';
import { ArrowLeft, Check, Trash2, Shield, Heart, MessageCircle, UserPlus, ShoppingBag, Calendar, Gift, AlertCircle, Video, CheckCheck } from 'lucide-react';
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
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { toast } from 'sonner';

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
      case 'new_post': return MessageCircle;
      case 'new_video': return Video;
      case 'sos_alert': 
      case 'helper_response':
      case 'emergency_contact':
        return Shield;
      case 'live_start': return Video;
      case 'circle_member':
      case 'circle_post':
      case 'circle_event':
        return UserPlus;
      case 'order_placed':
      case 'order_status':
      case 'new_product':
        return ShoppingBag;
      case 'product_review':
      case 'seller_follow':
        return Heart;
      case 'event': return Calendar;
      case 'reward': return Gift;
      default: return AlertCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like': return 'bg-red-100 text-red-600';
      case 'comment': return 'bg-blue-100 text-blue-600';
      case 'follow': return 'bg-green-100 text-green-600';
      case 'new_post': return 'bg-indigo-100 text-indigo-600';
      case 'new_video': return 'bg-purple-100 text-purple-600';
      case 'sos_alert':
      case 'helper_response':
      case 'emergency_contact':
        return 'bg-red-100 text-red-600';
      case 'live_start': return 'bg-purple-100 text-purple-600';
      case 'circle_member':
      case 'circle_post':
      case 'circle_event':
        return 'bg-blue-100 text-blue-600';
      case 'order_placed':
      case 'order_status':
      case 'new_product':
        return 'bg-green-100 text-green-600';
      case 'product_review':
      case 'seller_follow':
        return 'bg-yellow-100 text-yellow-600';
      case 'event': return 'bg-orange-100 text-orange-600';
      case 'reward': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isSafetyNotification = (type: string) => {
    return ['sos_alert', 'helper_response', 'emergency_contact', 'alert_update'].includes(type);
  };

  const isSocialNotification = (type: string) => {
    return ['like', 'comment', 'follow', 'mention', 'new_post', 'new_video', 'circle_member', 'circle_post', 'circle_event'].includes(type);
  };

  const isShopNotification = (type: string) => {
    return ['order_placed', 'order_status', 'product_review', 'seller_follow', 'new_product'].includes(type);
  };

  const safetyNotifications = dbNotifications.filter(n => isSafetyNotification(n.notification_type));
  const socialNotifications = dbNotifications.filter(n => isSocialNotification(n.notification_type));
  const shopNotifications = dbNotifications.filter(n => isShopNotification(n.notification_type));

  const markAllAsRead = async () => {
    const unreadIds = dbNotifications.filter(n => !n.read_at).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead.mutateAsync(id);
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('push_notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: any) => {
    const data = notification.data || {};
    
    // Mark as read if unread
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on notification type
    switch (notification.notification_type) {
      case 'like':
      case 'comment':
      case 'new_post':
        if (data.postId) navigate(`/post/${data.postId}`);
        break;
      
      case 'new_video':
      case 'video_like':
      case 'video_comment':
        navigate('/'); // Videos are on home feed
        break;
      
      case 'follow':
        if (data.userId) navigate(`/profile/${data.userId}`);
        break;
      
      case 'circle_member':
        if (data.circleId) navigate(`/circles/${data.circleId}`);
        break;
      
      case 'circle_post':
        if (data.postId && data.circleId) {
          navigate(`/circles/${data.circleId}/post/${data.postId}`);
        } else if (data.circleId) {
          navigate(`/circles/${data.circleId}`);
        }
        break;
      
      case 'circle_event':
        if (data.circleId) navigate(`/circles/${data.circleId}`);
        break;
      
      case 'order_placed':
      case 'order_status':
        if (data.orderId) navigate('/cart'); // Navigate to cart/orders
        break;
      
      case 'product_review':
      case 'new_product':
        if (data.itemId) navigate(`/product/${data.itemId}`);
        break;
      
      case 'seller_follow':
        if (data.sellerId) navigate(`/seller/${data.sellerId}`);
        break;
      
      case 'sos_alert':
      case 'helper_response':
      case 'emergency_contact':
      case 'alert_update':
        navigate('/safe');
        break;
      
      case 'live_start':
        if (data.streamId) navigate(`/live/${data.streamId}`);
        break;
      
      default:
        // Do nothing for unknown types
        break;
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return dbNotifications.filter(n => !n.read_at);
      case 'safety':
        return safetyNotifications;
      case 'social':
        return socialNotifications;
      case 'shop':
        return shopNotifications;
      default:
        return dbNotifications;
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const Icon = getNotificationIcon(notification.notification_type);
    const profile = notification.data?.userId ? getProfileById(notification.data.userId) : null;
    const isUnread = !notification.read_at;
    const isSafety = isSafetyNotification(notification.notification_type);

    const handleProfileClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (notification.data?.userId) {
        navigate(`/profile/${notification.data.userId}`);
      }
    };
    
    const swipeHandlers = useSwipeGestures(
      {
        onSwipeLeft: () => {
          setIsDeleting(true);
          setTimeout(() => {
            deleteNotification(notification.id);
          }, 300);
        },
        onSwipeRight: () => {
          if (isUnread) {
            markAsRead.mutate(notification.id);
            toast.success('Marked as read');
          }
        },
      },
      {
        threshold: 100,
      }
    );

    const handleDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDeleting(true);
      setTimeout(() => {
        deleteNotification(notification.id);
      }, 300);
    };

    const handleMarkRead = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isUnread) {
        await markAsRead.mutateAsync(notification.id);
      }
    };
    
    return (
      <div 
        {...swipeHandlers}
        className={`relative px-4 py-3 border-b border-border hover:bg-muted/50 active:bg-muted transition-all cursor-pointer ${
          isUnread ? 'bg-primary/5 border-l-2 border-l-primary' : ''
        } ${isDeleting ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {profile ? (
              <Avatar 
                className="size-9 transition-transform hover:scale-105 cursor-pointer"
                onClick={handleProfileClick}
              >
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback 
                  className="text-xs font-medium text-white"
                  style={{ backgroundColor: profile.avatar_color }}
                >
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className={`p-2 rounded-full shadow-sm transition-transform hover:scale-105 ${getNotificationColor(notification.notification_type)}`}>
                <Icon className="size-4" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="font-semibold text-xs text-foreground truncate">{notification.title}</h3>
                {isUnread && (
                  <div className="size-1.5 bg-primary rounded-full flex-shrink-0 animate-pulse" />
                )}
                {isSafety && (
                  <Badge variant="destructive" className="text-[10px] px-1 py-0 flex-shrink-0 animate-pulse">Urgent</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkRead}
                    className="h-5 w-5 p-0 hover:bg-primary/20 hover:text-primary transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="size-2.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-2.5" />
                </Button>
              </div>
            </div>
            
            <p className="text-muted-foreground text-xs line-clamp-2 mb-1.5 leading-relaxed">{notification.body}</p>
            
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
            <TabsTrigger value="shop" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Shop ({shopNotifications.length})
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

        <TabsContent value="shop" className="mt-0">
          <div className="divide-y divide-border">
            {getFilteredNotifications().map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {getFilteredNotifications().length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <div className="p-4 bg-muted rounded-full mb-4 animate-scale-in">
            <Check className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground text-sm px-8">
            {activeTab === 'unread' 
              ? "You're all caught up! No unread notifications." 
              : activeTab === 'safety'
              ? "No safety alerts. Stay safe!"
              : activeTab === 'social'
              ? "No social updates yet. Start engaging with content!"
              : activeTab === 'shop'
              ? "No shop updates. Browse our marketplace!"
              : "You're all caught up! Check back later for new notifications."}
          </p>
        </div>
      )}

      {/* Swipe hint for mobile */}
      {dbNotifications.length > 0 && (
        <div className="px-4 py-3 bg-muted/30 text-center border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            💡 Swipe left to delete • Swipe right to mark as read
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
import React, { useState } from 'react';
import { ArrowLeft, Check, Trash2, Shield, Heart, MessageCircle, UserPlus, ShoppingBag, Calendar, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FooterNav from '@/components/FooterNav';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'safety',
    icon: Shield,
    title: 'Emergency Alert Resolved',
    message: 'The emergency situation in your area has been resolved. Thank you for your cooperation.',
    time: '2 min ago',
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'social',
    icon: Heart,
    title: 'Sarah liked your post',
    message: 'Your wellness tip post received a like',
    time: '15 min ago',
    isRead: false,
    avatar: { color: '#8B5CF6', initials: 'SJ' }
  },
  {
    id: '3',
    type: 'social',
    icon: MessageCircle,
    title: 'New comment on your story',
    message: 'Mike commented: "This looks amazing! 🔥"',
    time: '1h ago',
    isRead: true,
    avatar: { color: '#10B981', initials: 'MR' }
  },
  {
    id: '4',
    type: 'social',
    icon: UserPlus,
    title: 'Emma started following you',
    message: 'You have a new follower',
    time: '2h ago',
    isRead: false,
    avatar: { color: '#F59E0B', initials: 'EW' }
  },
  {
    id: '5',
    type: 'order',
    icon: ShoppingBag,
    title: 'Order Delivered',
    message: 'Your order #12345 has been delivered successfully',
    time: '3h ago',
    isRead: true
  },
  {
    id: '6',
    type: 'safety',
    icon: Shield,
    title: 'Weekly Safety Check',
    message: 'Complete your weekly safety check-in',
    time: '1 day ago',
    isRead: false,
    priority: 'medium'
  },
  {
    id: '7',
    type: 'event',
    icon: Calendar,
    title: 'Wellness Circle Meeting',
    message: 'Your wellness circle meeting starts in 30 minutes',
    time: '2 days ago',
    isRead: true
  },
  {
    id: '8',
    type: 'reward',
    icon: Gift,
    title: 'Congratulations!',
    message: 'You earned 50 wellness points for your daily check-in streak',
    time: '3 days ago',
    isRead: true
  }
];

import { type TabKey } from '@/hooks/useAppNav';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const safetyNotifications = notifications.filter(n => n.type === 'safety');
  const socialNotifications = notifications.filter(n => n.type === 'social');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'safety':
        return safetyNotifications;
      case 'social':
        return socialNotifications;
      default:
        return notifications;
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = notification.icon;
    
    return (
      <div 
        className={`px-2 py-1 border-b border-border hover:bg-muted/50 transition-colors ${
          !notification.isRead ? 'bg-primary/5' : ''
        }`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {notification.avatar ? (
              <div 
                className="size-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: notification.avatar.color }}
              >
                {notification.avatar.initials}
              </div>
            ) : (
              <div className={`p-2 rounded-full ${
                notification.type === 'safety' ? 'bg-red-100 text-red-600' :
                notification.type === 'social' ? 'bg-blue-100 text-blue-600' :
                notification.type === 'order' ? 'bg-green-100 text-green-600' :
                notification.type === 'event' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                <Icon className="size-4" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-medium text-sm">{notification.title}</h3>
              {!notification.isRead && (
                <div className="size-2 bg-primary rounded-full" />
              )}
              {notification.priority === 'high' && (
                <Badge variant="destructive" className="text-xs">Urgent</Badge>
              )}
              {notification.priority === 'medium' && (
                <Badge variant="secondary" className="text-xs">Important</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-1">{notification.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{notification.time}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              All ({notifications.length})
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
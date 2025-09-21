import React, { useState } from 'react';
import { ArrowLeft, Search, Phone, Video, Plus, Send, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FooterNav from '@/components/FooterNav';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    name: 'Sarah Johnson',
    initials: 'SJ',
    color: '#8B5CF6',
    lastMessage: 'Thanks for the wellness tip! 🙏',
    time: '2m ago',
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: '1', text: 'Hey! How are you doing?', time: '10:30 AM', isSent: false },
      { id: '2', text: 'I\'m doing well, thanks! Just finished my morning meditation', time: '10:32 AM', isSent: true },
      { id: '3', text: 'That\'s awesome! I should start doing that too', time: '10:33 AM', isSent: false },
      { id: '4', text: 'You should! I have some great resources if you\'re interested', time: '10:35 AM', isSent: true },
      { id: '5', text: 'Thanks for the wellness tip! 🙏', time: '10:36 AM', isSent: false }
    ]
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    initials: 'MR',
    color: '#10B981',
    lastMessage: 'See you at the wellness circle!',
    time: '15m ago',
    unreadCount: 0,
    isOnline: true,
    messages: [
      { id: '1', text: 'Don\'t forget about our wellness circle meeting today', time: '9:15 AM', isSent: false },
      { id: '2', text: 'Of course! What time again?', time: '9:20 AM', isSent: true },
      { id: '3', text: '3 PM at the community center', time: '9:22 AM', isSent: false },
      { id: '4', text: 'Perfect, I\'ll be there', time: '9:25 AM', isSent: true },
      { id: '5', text: 'See you at the wellness circle!', time: '9:30 AM', isSent: false }
    ]
  },
  {
    id: '3',
    name: 'Emma Wilson',
    initials: 'EW',
    color: '#F59E0B',
    lastMessage: 'Love your latest story!',
    time: '1h ago',
    unreadCount: 1,
    isOnline: false,
    messages: [
      { id: '1', text: 'Love your latest story!', time: '8:45 AM', isSent: false }
    ]
  },
  {
    id: '4',
    name: 'David Chen',
    initials: 'DC',
    color: '#EF4444',
    lastMessage: 'Thanks for the safety tip',
    time: '2h ago',
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: '1', text: 'Thanks for the safety tip', time: '7:30 AM', isSent: false }
    ]
  },
  {
    id: '5',
    name: 'Lisa Park',
    initials: 'LP',
    color: '#6366F1',
    lastMessage: 'Can you help me with my order?',
    time: '3h ago',
    unreadCount: 3,
    isOnline: true,
    messages: [
      { id: '1', text: 'Hi! I need help with my recent order', time: '6:15 AM', isSent: false },
      { id: '2', text: 'The tracking shows it was delivered but I haven\'t received it', time: '6:16 AM', isSent: false },
      { id: '3', text: 'Can you help me with my order?', time: '6:20 AM', isSent: false }
    ]
  }
];

import { type TabKey } from '@/hooks/useAppNav';

const Messages = () => {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const totalUnreadCount = mockConversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true
    };
    
    selectedConversation.messages.push(newMsg);
    setNewMessage('');
    
    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! 😊',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: false
      };
      selectedConversation.messages.push(response);
    }, 1000);
  };

  if (selectedConversation) {
    return (
      <div className="h-screen bg-background flex flex-col" data-testid="messages-chat-view">
        {/* Chat Header */}
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="p-2"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div 
                className="size-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: selectedConversation.color }}
              >
                {selectedConversation.initials}
              </div>
              <div>
                <h2 className="font-medium">{selectedConversation.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Phone className="size-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Video className="size-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreVertical className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.isSent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Plus className="size-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Paperclip className="size-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-10"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              >
                <Smile className="size-4" />
              </Button>
            </div>
            <Button onClick={sendMessage} size="sm" className="p-2">
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="messages-page">
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
              <h1 className="text-xl font-semibold">Messages</h1>
              {totalUnreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalUnreadCount} unread message{totalUnreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-border">
        {filteredConversations.map(conversation => (
          <div
            key={conversation.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => setSelectedConversation(conversation)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="size-12 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: conversation.color }}
                >
                  {conversation.initials}
                </div>
                {conversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 size-4 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{conversation.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2 flex-shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No conversations found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation to get started'}
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

export default Messages;
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X } from 'lucide-react';
import { useSOSMessages } from '@/hooks/useSOSMessages';
import { formatDistanceToNow } from 'date-fns';

interface SOSMessagingProps {
  alertId: string;
  onClose?: () => void;
}

export const SOSMessaging: React.FC<SOSMessagingProps> = ({ alertId, onClose }) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage } = useSOSMessages(alertId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    await sendMessage.mutateAsync({
      alertId,
      messageText: messageText.trim(),
    });

    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">SOS Messages</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">No messages yet</div>
          </div>
        ) : (
          messages.map((message: any) => {
            const isSystemMessage = message.is_system_message;
            const profile = message.profiles;

            if (isSystemMessage) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {message.message_text}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback 
                    style={{ 
                      backgroundColor: profile?.avatar_color || '#3b82f6' 
                    }}
                    className="text-white text-xs"
                  >
                    {profile?.initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>
                  <div className="bg-gray-100 text-gray-900 text-sm px-3 py-2 rounded-lg">
                    {message.message_text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessage.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

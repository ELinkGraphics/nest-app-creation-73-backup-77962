import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { Conversation } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { usePresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface ChatViewProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserAvatar?: string | null;
  currentUserInitials: string;
  currentUserName: string;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  conversation, 
  currentUserId, 
  currentUserAvatar,
  currentUserInitials,
  currentUserName,
  onBack 
}) => {
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading } = useMessages(conversation.conversation_id, currentUserId);
  const { sendMessage, isSending } = useSendMessage();
  const { isUserOnline } = usePresence(currentUserId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    conversation.conversation_id,
    currentUserId,
    currentUserName
  );

  const handleProfileClick = () => {
    navigate(`/profile/${conversation.other_user_id}`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || isSending) return;

    stopTyping();

    sendMessage({
      conversationId: conversation.conversation_id,
      senderId: currentUserId,
      content: messageText.trim(),
    });

    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <div className="flex flex-col h-screen lg:h-full bg-background">
      {/* Header */}
      <div className="flex-none sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-3 py-3 safe-top">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="lg:hidden -ml-2 h-10 w-10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div 
            className="relative cursor-pointer active:scale-95 transition-transform"
            onClick={handleProfileClick}
          >
            <Avatar className="h-11 w-11">
              <AvatarImage src={conversation.other_user_avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                {conversation.other_user_initials}
              </AvatarFallback>
            </Avatar>
            {isUserOnline(conversation.other_user_id) && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-background" />
            )}
          </div>

          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={handleProfileClick}
          >
            <h2 className="font-semibold text-foreground truncate text-base">
              {conversation.other_user_name}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                @{conversation.other_user_username}
              </p>
              {isUserOnline(conversation.other_user_id) && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Online</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pb-20 space-y-3 overscroll-contain">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div className="animate-fade-in">
              <p className="text-muted-foreground text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex gap-2 animate-fade-in ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!isOwn && (
                  <Avatar 
                    className="h-8 w-8 shrink-0 mt-1 cursor-pointer active:scale-95 transition-transform"
                    onClick={handleProfileClick}
                  >
                    <AvatarImage src={conversation.other_user_avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      {conversation.other_user_initials}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>

                {isOwn && (
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarImage src={currentUserAvatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                      {currentUserInitials}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground italic animate-fade-in">
          {typingUsers[0]} is typing...
        </div>
      )}

      {/* Message Input - Fixed at bottom */}
      <div className="flex-none fixed bottom-0 left-0 right-0 lg:sticky bg-background border-t border-border safe-bottom">
        <div className="flex gap-2 p-3 max-w-screen-xl mx-auto">
          <Textarea
            value={messageText}
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="resize-none min-h-[44px] max-h-32 text-[16px] rounded-2xl"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full active:scale-95 transition-transform"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;

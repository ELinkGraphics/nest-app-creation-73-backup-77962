import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/hooks/useConversations';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  isLoading: boolean;
  currentUserId: string;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
  currentUserId,
}) => {
  const { isUserOnline } = usePresence(currentUserId);
  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-border/50">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6 animate-fade-in">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-base font-semibold text-foreground mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by messaging someone from their profile
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => {
        const isSelected = conversation.conversation_id === selectedConversationId;
        const isLastMessageFromOther = conversation.last_message_sender_id !== currentUserId;
        const isUnread = conversation.unread_count > 0 && isLastMessageFromOther;

        return (
          <button
            key={conversation.conversation_id}
            onClick={() => onSelectConversation(conversation.conversation_id)}
            className={`w-full flex items-center gap-3 p-4 border-b border-border/50 active:bg-muted/70 transition-colors text-left ${
              isSelected ? 'bg-muted' : 'hover:bg-muted/30'
            }`}
          >
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.other_user_avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                  {conversation.other_user_initials}
                </AvatarFallback>
              </Avatar>
              {isUserOnline(conversation.other_user_id) && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold truncate text-base ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                  {conversation.other_user_name}
                </h3>
                {conversation.last_message_at && (
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate flex-1 ${isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {conversation.last_message || 'No messages yet'}
                </p>
                {isUnread && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shrink-0">
                    {conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationsList;

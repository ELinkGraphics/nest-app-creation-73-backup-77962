import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  ThumbsUp, 
  Clock, 
  Plus,
  Award,
  AlertTriangle
} from 'lucide-react';

interface ThreadUpdate {
  id: string;
  content: string;
  timestamp: string;
  upvotes: number;
  isOriginalPoster: boolean;
}

interface AnonymousThread {
  id: string;
  originalQuestion: string;
  category: string;
  tags: string[];
  timestamp: string;
  upvotes: number;
  isUrgent: boolean;
  hasExpertAnswer: boolean;
  updates: ThreadUpdate[];
  canContinue: boolean; // If current user is original poster
}

interface AnonymousThreadProps {
  thread: AnonymousThread;
  onContinueThread?: () => void;
  onUpvote?: (updateId: string) => void;
}

export const AnonymousThreadComponent: React.FC<AnonymousThreadProps> = ({
  thread,
  onContinueThread,
  onUpvote
}) => {
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  
  const displayedUpdates = showAllUpdates ? thread.updates : thread.updates.slice(0, 2);
  const hasMoreUpdates = thread.updates.length > 2;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'parenting': return '👶';
      case 'health': return '🏥';
      case 'relationships': return '💕';
      case 'career': return '💼';
      case 'mental-health': return '🧠';
      case 'education': return '📚';
      case 'lifestyle': return '🌟';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      {/* Original Post */}
      <div className="p-4 bg-muted/20">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src="/src/assets/anonymous-logo.png" 
            alt="Anonymous" 
            className="w-8 h-8 rounded-full border-2 border-primary/20"
          />
          <div className="flex flex-col">
            <span className="text-username font-medium text-foreground">Anonymous</span>
            <span className="text-timestamp text-muted-foreground">{thread.timestamp}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {getCategoryIcon(thread.category)} {thread.category}
            </Badge>
            {thread.isUrgent && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>

        <p className="text-post-content text-foreground leading-relaxed font-normal mb-3">
          {thread.originalQuestion}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {thread.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Original Post Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            {thread.upvotes}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {thread.updates.length} update{thread.updates.length !== 1 ? 's' : ''}
          </div>
          {thread.hasExpertAnswer && (
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs">
              <Award className="w-3 h-3 mr-1" />
              Expert Answered
            </Badge>
          )}
        </div>
      </div>

      {/* Thread Updates */}
      {thread.updates.length > 0 && (
        <div className="relative">
          {/* Thread Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/30 z-0" />
          
          {displayedUpdates.map((update, index) => (
            <div key={update.id} className="relative">
              <div className="p-4 pl-16 bg-white relative z-10">
                {/* Thread Connector */}
                <div className="absolute left-8 top-6 w-6 h-0.5 bg-primary/30" />
                <div className="absolute left-6 top-5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                
                <div className="flex items-start gap-3">
                  <img 
                    src="/src/assets/anonymous-logo.png" 
                    alt="Anonymous" 
                    className="w-6 h-6 rounded-full border border-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">Anonymous</span>
                      {update.isOriginalPoster && (
                        <Badge variant="secondary" className="text-xs">OP</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                    </div>
                    
                    <p className="text-post-content text-foreground leading-relaxed font-normal mb-2">
                      {update.content}
                    </p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpvote?.(update.id)}
                      className="text-muted-foreground hover:text-primary h-8 px-2"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {update.upvotes}
                    </Button>
                  </div>
                </div>
              </div>
              
              {index < displayedUpdates.length - 1 && (
                <Separator className="ml-16" />
              )}
            </div>
          ))}

          {/* Show More Button */}
          {hasMoreUpdates && !showAllUpdates && (
            <div className="p-4 pl-16 relative z-10">
              <div className="absolute left-8 top-6 w-6 h-0.5 bg-primary/30" />
              <div className="absolute left-6 top-5 w-2 h-2 bg-muted-foreground rounded-full border-2 border-white" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllUpdates(true)}
                className="text-primary hover:text-primary/80"
              >
                Show {thread.updates.length - 2} more update{thread.updates.length - 2 !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Continue Thread Button for Original Poster */}
          {thread.canContinue && (
            <div className="p-4 pl-16 border-t border-dashed border-primary/30 bg-primary/5 relative z-10">
              <div className="absolute left-8 top-6 w-6 h-0.5 bg-primary/30" />
              <div className="absolute left-6 top-5 w-2 h-2 bg-primary rounded-full border-2 border-white animate-pulse" />
              
              <Button
                onClick={onContinueThread}
                className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Continue your story
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnonymousThreadComponent;
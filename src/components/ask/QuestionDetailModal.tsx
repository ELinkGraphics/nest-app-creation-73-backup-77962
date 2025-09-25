import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AnonymousThreadComponent from './AnonymousThread';
import { 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  Award,
  Send,
  Share2,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Answer {
  id: string;
  content: string;
  isExpert: boolean;
  expertTitle?: string;
  upvotes: number;
  timestamp: string;
  isHelpful: boolean;
}

interface Question {
  id: string;
  question: string;
  category: string;
  tags: string[];
  timestamp: string;
  answerCount: number;
  upvotes: number;
  isUrgent: boolean;
  hasExpertAnswer: boolean;
  aiResponse?: string;
  answers: Answer[];
  isThread?: boolean;
  threadUpdates?: number;
  lastUpdate?: string;
  threadData?: {
    canContinue: boolean;
    updates: Array<{
      id: string;
      content: string;
      timestamp: string;
      upvotes: number;
      isOriginalPoster: boolean;
    }>;
  };
}

interface QuestionDetailModalProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question,
  isOpen,
  onClose
}) => {
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnswer.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Opinion submitted!",
        description: "Your helpful response has been added to this question.",
      });
      setNewAnswer('');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleContinueThread = () => {
    console.log('Opening compose modal for thread continuation...');
    toast({
      title: "Continue Story",
      description: "Thread continuation feature coming soon!",
    });
  };

  const handleThreadUpvote = (updateId: string) => {
    console.log('Upvoting update:', updateId);
    toast({
      title: "Upvoted!",
      description: "Thanks for supporting this update.",
    });
  };

  // If this is a thread post, show the threaded view
  if (question.isThread && question.threadData) {
    const threadFormat = {
      id: question.id,
      originalQuestion: question.question,
      category: question.category,
      tags: question.tags,
      timestamp: question.timestamp,
      upvotes: question.upvotes,
      isUrgent: question.isUrgent,
      hasExpertAnswer: question.hasExpertAnswer,
      canContinue: question.threadData.canContinue,
      updates: question.threadData.updates
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>📖 Story Thread</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="active:bg-transparent active:text-primary">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <AnonymousThreadComponent
            thread={threadFormat}
            onContinueThread={handleContinueThread}
            onUpvote={handleThreadUpvote}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Regular question view for non-thread posts

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Question Details</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="active:bg-transparent active:text-primary">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Removed all topic labels and badges */}
            </div>

            <p className="text-sm text-foreground leading-relaxed">{question.question}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {question.timestamp}
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {question.upvotes} upvotes
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {question.answerCount} opinions
              </div>
            </div>
          </div>

          {/* AI Response */}
          {question.aiResponse && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">AI Insight</span>
              </div>
              <p className="text-muted-foreground">{question.aiResponse}</p>
            </div>
          )}

          <Separator />

          {/* Answers Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {question.answers.length === 0 ? 'No opinions yet' : `${question.answers.length} Opinion${question.answers.length === 1 ? '' : 's'}`}
            </h3>

            {question.answers.map((answer) => (
              <div key={answer.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Removed expert badge */}
                    <span className="text-xs text-muted-foreground">{answer.timestamp}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {answer.upvotes}
                  </Button>
                </div>
                
                <p className="text-comment-compact leading-relaxed">{answer.content}</p>
                
                {answer.isHelpful && (
                  <Badge variant="outline" className="text-xs">
                    ✅ Marked as helpful
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Add Answer Form */}
          <div className="space-y-3">
            <h4 className="font-medium">Your Opinion</h4>
            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <Textarea
                placeholder="Share your experience, advice, or insights to help with this question..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Your opinion will be posted anonymously
                </p>
                <Button 
                  type="submit" 
                  disabled={!newAnswer.trim() || isSubmitting}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Opinion
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
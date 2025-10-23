import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PersistentCommentComposer } from '@/components/PersistentCommentComposer';
import { useAnswers, useCreateAnswer } from '@/hooks/useAnswers';
import { useQuestion } from '@/hooks/useQuestions';
import { supabase } from '@/integrations/supabase/client';
import { 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Sparkles,
  Share2,
  Bookmark,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface QuestionDetailModalProps {
  question: any;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  question: initialQuestion,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { data: fullQuestion } = useQuestion(initialQuestion.id);
  const { data: answers, isLoading: answersLoading } = useAnswers(initialQuestion.id);
  const createAnswer = useCreateAnswer();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUserProfile(profile);
      }
    };
    fetchCurrentUser();
  }, []);

  // Set up realtime subscription for answers
  useEffect(() => {
    if (!initialQuestion.id) return;

    const channel = supabase
      .channel(`answers:${initialQuestion.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${initialQuestion.id}`
        },
        () => {
          // Refetch answers when changes occur
          // The useQuery will handle this automatically
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialQuestion.id]);

  const handleSubmitAnswer = async (answerText: string) => {
    try {
      await createAnswer.mutateAsync({
        questionId: initialQuestion.id,
        answer: answerText,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const question = fullQuestion || initialQuestion;
  const isQuestionAuthor = currentUser && question.user_id === currentUser.id;
  const questionIsAnonymous = question.is_anonymous;

  // Determine display name for current user in composer
  let displayName: string | undefined;
  let displayAvatar: string | undefined;
  let displayColor: string | undefined;

  if (isQuestionAuthor && questionIsAnonymous) {
    // Question author commenting anonymously
    displayName = question.anonymous_name || 'Anonymous';
    displayColor = '#4B164C';
  } else if (currentUserProfile) {
    // Regular user with profile
    displayName = currentUserProfile.initials;
    displayAvatar = currentUserProfile.avatar_url;
    displayColor = currentUserProfile.avatar_color;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pb-24">
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
            {/* Asker info */}
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/anonymous-logo.png" 
                alt="Asker" 
                className="w-8 h-8 rounded-full border-2 border-primary/20"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {question.is_anonymous 
                    ? (question.anonymous_name || 'Anonymous') 
                    : 'User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{question.question}</p>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {question.upvotes || 0} upvotes
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {answers?.length || 0} opinions
              </div>
            </div>
          </div>

          {/* AI Response */}
          {question.ai_response && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">{question.ai_response}</p>
            </div>
          )}

          <Separator />

          {/* Answers Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {!answers || answers.length === 0 
                ? 'No opinions yet' 
                : `${answers.length} Opinion${answers.length === 1 ? '' : 's'}`}
            </h3>

            {answersLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {answers?.map((answer: any) => {
              const isAnswerByQuestionAuthor = answer.user_id === question.user_id;
              const showAnonymousName = isAnswerByQuestionAuthor && questionIsAnonymous;
              
              let answerDisplayName = 'Anonymous';
              let answerAvatar = '/src/assets/anonymous-logo.png';
              let answerColor = '#4B164C';

              if (showAnonymousName) {
                answerDisplayName = question.anonymous_name || 'Anonymous (OP)';
              } else if (answer.profile) {
                answerDisplayName = answer.profile.name || answer.profile.username || 'User';
                answerAvatar = answer.profile.avatar_url || answerAvatar;
                answerColor = answer.profile.avatar_color || answerColor;
              }

              return (
                <div key={answer.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-8 rounded-full grid place-items-center text-xs font-medium text-white overflow-hidden"
                        style={{ backgroundColor: answerColor }}
                      >
                        {answer.profile?.avatar_url ? (
                          <img src={answer.profile.avatar_url} alt={answerDisplayName} className="w-full h-full object-cover" />
                        ) : (
                          <img src={answerAvatar} alt={answerDisplayName} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {answerDisplayName}
                          {showAnonymousName && ' (OP)'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      0
                    </Button>
                  </div>
                  
                  <p className="text-sm leading-relaxed">{answer.answer}</p>
                  
                  {answer.is_helpful && (
                    <Badge variant="outline" className="text-xs">
                      ✅ Marked as helpful
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Persistent Comment Composer */}
        <PersistentCommentComposer
          onSubmit={handleSubmitAnswer}
          placeholder="Share your opinion..."
          displayName={displayName}
          displayAvatar={displayAvatar}
          displayColor={displayColor}
        />
      </DialogContent>
    </Dialog>
  );
};
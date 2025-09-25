import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PersistentCommentComposer } from '@/components/PersistentCommentComposer';
import { ScrollTriggeredAIInsight } from '@/components/ask/ScrollTriggeredAIInsight';
import { 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  Award,
  ArrowLeft,
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
}

// Mock data - in real app this would come from API
const mockQuestion: Question = {
  id: '1',
  question: 'How do I handle my teenager who refuses to do homework and gets angry when I try to help?',
  category: 'parenting',
  tags: ['teenagers', 'homework', 'behavior', 'anger'],
  timestamp: '2h',
  answerCount: 12,
  upvotes: 8,
  isUrgent: false,
  hasExpertAnswer: true,
  aiResponse: 'This is a common challenge in parenting teenagers. Consider establishing clear boundaries while maintaining open communication. Setting up a structured homework time and creating a supportive environment can help.',
  answers: [
    {
      id: '1',
      content: 'I went through the same thing with my daughter. What worked for us was creating a homework schedule together and letting her choose her study space. Also, instead of helping directly, I started asking her what she thought the problem was asking for first.',
      isExpert: false,
      upvotes: 5,
      timestamp: '1h',
      isHelpful: true
    },
    {
      id: '2',
      content: 'As a child psychologist, I recommend focusing on the emotional aspect first. Teenagers often resist homework due to underlying anxiety or fear of failure. Try having a conversation about what makes homework difficult for them before addressing the behavior.',
      isExpert: true,
      expertTitle: 'Child Psychologist',
      upvotes: 12,
      timestamp: '45m',
      isHelpful: true
    }
  ]
};

const QuestionDetail: React.FC = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question] = useState<Question>(mockQuestion);

  const handleCommentSubmit = (comment: string) => {
    toast({
      title: "Opinion submitted!",
      description: "Your helpful response has been added to this question.",
    });
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/ask')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="active:bg-transparent active:text-primary">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-32">
        <div className="space-y-6 pt-6">
          {/* Question Header */}
          <div className="space-y-3">
            {/* Asker Profile */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/src/assets/anonymous-logo.png" 
                alt="Anonymous Asker" 
                className="w-10 h-10 rounded-full border-2 border-primary/20"
              />
              <div className="flex flex-col">
                <span className="text-username font-medium text-foreground">Anonymous Asker</span>
                <span className="text-timestamp text-muted-foreground">{question.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-100 text-blue-800">
                {getCategoryIcon(question.category)} {question.category}
              </Badge>
              {question.isUrgent && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {question.hasExpertAnswer && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  <Award className="w-3 h-3 mr-1" />
                  Expert Answered
                </Badge>
              )}
            </div>

            <p className="text-post-content text-foreground leading-relaxed font-normal">
              {question.question}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* AI Response with Scroll Animation */}
            {question.aiResponse && (
              <div className="mb-2">
                <ScrollTriggeredAIInsight content={question.aiResponse} />
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

          <Separator />

          {/* Opinions Section */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">
              {question.answers.length === 0 ? 'No opinions yet' : `${question.answers.length} Opinion${question.answers.length === 1 ? '' : 's'}`}
            </h2>

            {question.answers.map((answer) => (
              <div key={answer.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {answer.isExpert && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                        <Award className="w-3 h-3 mr-1" />
                        {answer.expertTitle || 'Expert'}
                      </Badge>
                    )}
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
                
                <p className="text-post-content text-foreground leading-relaxed font-normal">{answer.content}</p>
                
                {answer.isHelpful && (
                  <Badge variant="outline" className="text-xs">
                    ✅ Marked as helpful
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Comment Input */}
      <PersistentCommentComposer
        onSubmit={handleCommentSubmit}
        placeholder="Write your opinion"
      />
    </div>
  );
};

export default QuestionDetail;
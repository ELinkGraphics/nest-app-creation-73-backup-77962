import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollTriggeredAIInsight } from './ScrollTriggeredAIInsight';
import { 
  ThumbsUp, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  Award
} from 'lucide-react';

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
}

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

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

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'parenting': return 'bg-blue-100 text-blue-800';
    case 'health': return 'bg-red-100 text-red-800';
    case 'relationships': return 'bg-pink-100 text-pink-800';
    case 'career': return 'bg-purple-100 text-purple-800';
    case 'mental-health': return 'bg-green-100 text-green-800';
    case 'education': return 'bg-yellow-100 text-yellow-800';
    case 'lifestyle': return 'bg-indigo-100 text-indigo-800';
    case 'family': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/ask/question/${question.id}`);
  };

  return (
    <Card 
      className="cursor-pointer shadow-sm border-l-4 border-l-primary/20 border-r-4 border-r-primary/20 hover:border-l-primary hover:shadow-lg transition-all duration-200"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Asker Profile */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img 
              src="/src/assets/anonymous-logo.png" 
              alt="Anonymous Asker" 
              className="w-8 h-8 rounded-full border-2 border-primary/20"
            />
            {question.isUrgent && (
              <div className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 bg-red-500 text-white text-[7px] font-bold rounded-full border border-white shadow-sm animate-slide-in-right">
                URG
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Anonymous Asker</span>
            <span className="text-xs text-muted-foreground">{question.timestamp}</span>
          </div>
        </div>

        {/* Header - removed category badges and labels */}
        <div className="flex items-center justify-between mb-3">
          {/* Empty header space - removed all badges */}
        </div>

        {/* Question content */}
        <p className="text-foreground text-sm mb-3 line-clamp-3 leading-relaxed">
          {question.question}
        </p>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {question.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{question.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* AI Response Preview with Scroll Animation */}
        {question.aiResponse && (
          <div className="mb-3">
            <ScrollTriggeredAIInsight content={question.aiResponse} />
          </div>
        )}

        {/* Footer with stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                // Handle upvote
              }}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {question.upvotes}
            </Button>
            
            <div className="flex items-center text-muted-foreground text-sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              {question.answerCount} {question.answerCount === 1 ? 'opinion' : 'opinions'}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
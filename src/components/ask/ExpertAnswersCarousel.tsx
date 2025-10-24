import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageCircle, BadgeCheck } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useExpertProfiles } from '@/hooks/useExpertProfiles';
import { useNavigate } from 'react-router-dom';

interface ExpertAnswersCarouselProps {
  onViewAnswer?: (answerId: string) => void;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'parenting': '👶',
    'health': '❤️',
    'relationships': '💑',
    'career': '💼',
    'mental-health': '🧠',
    'education': '📚',
    'lifestyle': '✨',
    'family': '👨‍👩‍👧‍👦',
    'other': '💭'
  };
  return icons[category] || '💭';
};

export const ExpertAnswersCarousel: React.FC<ExpertAnswersCarouselProps> = ({ 
  onViewAnswer 
}) => {
  const { data: experts, isLoading } = useExpertProfiles();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-primary" />
          Verified Experts
        </h2>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!experts || experts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-primary" />
        Verified Experts
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2">
          {experts.map((expert: any) => (
            <CarouselItem key={expert.id} className="pl-2 basis-[85%]">
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-muted/30">
                <CardContent className="p-4 space-y-3">
                  {/* Expert Info */}
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={expert.profiles?.avatar_url} />
                      <AvatarFallback style={{ backgroundColor: expert.profiles?.avatar_color }}>
                        {expert.profiles?.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold truncate">
                          {expert.profiles?.name || expert.profiles?.username}
                        </h3>
                        {expert.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{expert.specialty}</p>
                      {expert.years_experience && (
                        <p className="text-xs text-muted-foreground">
                          {expert.years_experience} years experience
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Featured Answer Preview */}
                  {expert.featured_answer && (
                    <>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryIcon(expert.specialty)} Featured Answer
                        </Badge>
                        <p className="text-sm font-medium line-clamp-2">
                          {expert.featured_answer.questions?.question}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {expert.featured_answer.content}
                        </p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/ask/question/${expert.featured_answer.question_id}`)}
                      >
                        View Answer
                      </Button>
                    </>
                  )}

                  {/* Bio if no featured answer */}
                  {!expert.featured_answer && expert.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {expert.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

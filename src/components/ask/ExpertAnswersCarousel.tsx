import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Award, ThumbsUp, MessageCircle, ArrowRight } from 'lucide-react';
interface ExpertAnswer {
  id: string;
  expertName: string;
  expertTitle: string;
  expertAvatar: string;
  question: string;
  answer: string;
  category: string;
  upvotes: number;
  timestamp: string;
  verified: boolean;
}
const EXPERT_ANSWERS: ExpertAnswer[] = [{
  id: '1',
  expertName: 'Dr. Sarah Chen',
  expertTitle: 'Pediatrician',
  expertAvatar: 'https://i.pravatar.cc/40?img=1',
  question: 'How do I handle my 3-year-old\'s tantrums?',
  answer: 'Tantrums are normal developmental behavior. Stay calm, validate their feelings, and set consistent boundaries. Remember that this phase will pass with patience and consistency.',
  category: 'parenting',
  upvotes: 127,
  timestamp: '2 hours ago',
  verified: true
}, {
  id: '2',
  expertName: 'Michael Rodriguez',
  expertTitle: 'Licensed Therapist',
  expertAvatar: 'https://i.pravatar.cc/40?img=2',
  question: 'Dealing with postpartum anxiety - when to seek help?',
  answer: 'Postpartum anxiety affects many new mothers. If worries interfere with daily life or bonding, reach out to your healthcare provider. Early intervention leads to better outcomes.',
  category: 'mental-health',
  upvotes: 98,
  timestamp: '4 hours ago',
  verified: true
}, {
  id: '3',
  expertName: 'Dr. Amanda Wilson',
  expertTitle: 'Child Psychologist',
  expertAvatar: 'https://i.pravatar.cc/40?img=3',
  question: 'My teenager won\'t talk to me anymore',
  answer: 'Adolescence brings natural separation. Create safe spaces for conversation without judgment. Sometimes listening is more powerful than giving advice.',
  category: 'relationships',
  upvotes: 156,
  timestamp: '6 hours ago',
  verified: true
}, {
  id: '4',
  expertName: 'Lisa Thompson',
  expertTitle: 'Registered Nurse',
  expertAvatar: 'https://i.pravatar.cc/40?img=4',
  question: 'Safe sleep practices for newborns?',
  answer: 'Always place babies on their back to sleep, use a firm mattress, and keep the crib free of blankets, bumpers, and toys. Room-sharing without bed-sharing is recommended.',
  category: 'health',
  upvotes: 203,
  timestamp: '8 hours ago',
  verified: true
}];
interface ExpertAnswersCarouselProps {
  onViewAnswer: (answerId: string) => void;
}
export const ExpertAnswersCarousel: React.FC<ExpertAnswersCarouselProps> = ({
  onViewAnswer
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'parenting':
        return '👶';
      case 'health':
        return '🏥';
      case 'relationships':
        return '💕';
      case 'mental-health':
        return '🧠';
      default:
        return '❓';
    }
  };
  return <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-semibold text-foreground">Top Stories</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <Carousel opts={{
      align: "start",
      slidesToScroll: 1
    }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {EXPERT_ANSWERS.map(answer => <CarouselItem key={answer.id} className="pl-2 md:pl-4 basis-[280px] md:basis-[320px]">
              <Card className="h-full bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Expert Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={answer.expertAvatar} alt={answer.expertName} />
                      <AvatarFallback>{answer.expertName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{answer.expertName}</p>
                        {answer.verified && <Badge className="bg-secondary text-secondary-foreground text-xs px-1 py-0">
                            <Award className="w-2.5 h-2.5" />
                          </Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{answer.expertTitle}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <Badge className="w-fit mb-3 text-xs" variant="outline">
                    {getCategoryIcon(answer.category)} {answer.category}
                  </Badge>

                  {/* Question */}
                  <p className="text-xs font-medium text-foreground mb-2 line-clamp-2">
                    "{answer.question}"
                  </p>

                  {/* Answer Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1 mb-3">
                    {answer.answer}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {answer.upvotes}
                      </div>
                      <span>{answer.timestamp}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => onViewAnswer(answer.id)}>
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </div>;
};
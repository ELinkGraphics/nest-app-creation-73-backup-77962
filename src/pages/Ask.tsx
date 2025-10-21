import React, { useState } from 'react';
import Header from '../components/Header';
import FooterNav from '../components/FooterNav';
import { InstallPrompt } from '../components/InstallPrompt';
import { AskQuestionForm } from '../components/ask/AskQuestionForm';
import { QuestionFeed } from '../components/ask/QuestionFeed';
import { ExpertAnswersCarousel } from '../components/ask/ExpertAnswersCarousel';
import { AnonymousStoryModal } from '../components/ask/AnonymousStoryModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Edit3 } from 'lucide-react';
import { type TabKey } from '@/hooks/useAppNav';
interface AskProps {
  activeTab: TabKey;
  onTabSelect: (tab: TabKey) => void;
  onOpenCreate: () => void;
}
const Ask: React.FC<AskProps> = ({
  activeTab,
  onTabSelect,
  onOpenCreate
}) => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState("recent");
  const handleViewExpertAnswer = (answerId: string) => {
    // Navigate to answer detail or show in modal
    console.log('View expert answer:', answerId);
  };
  return <div className="min-h-screen bg-background" data-testid="ask-page">
      <InstallPrompt />
      <Header />
      
      <main className="container mx-auto max-w-2xl px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Ask Anonymously
            </h1>
            <p className="text-muted-foreground text-sm">Get advice from our community without judgment</p>
          </div>
          
          
        </div>

        {/* Expert Answers Carousel */}
        <div className="mb-8 -mx-4">
          <ExpertAnswersCarousel onViewAnswer={handleViewExpertAnswer} />
        </div>

        {/* Ask Question Form Modal */}
        {showQuestionForm && <AskQuestionForm isOpen={showQuestionForm} onClose={() => setShowQuestionForm(false)} />}

        {/* Anonymous Story Modal */}
        {showStoryModal && <AnonymousStoryModal isOpen={showStoryModal} onClose={() => setShowStoryModal(false)} />}

        {/* Question Feed Tabs */}
        <Tabs value={activeQuestionTab} onValueChange={setActiveQuestionTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="unanswered">Expert</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowQuestionForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </div>
          
          <TabsContent value="recent" className="mt-6">
            <QuestionFeed filter="recent" />
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            <QuestionFeed filter="trending" />
          </TabsContent>
          
          <TabsContent value="unanswered" className="mt-6">
            <QuestionFeed filter="unanswered" />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Pin Button */}
      

      <FooterNav 
        active={activeTab} 
        onSelect={() => {}} // Navigation handled by FooterNav directly
        onOpenCreate={onOpenCreate}
        onOpenStoryModal={() => setShowStoryModal(true)}
      />
    </div>;
};
export default Ask;
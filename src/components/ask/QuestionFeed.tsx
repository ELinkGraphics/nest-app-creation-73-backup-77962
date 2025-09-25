import React, { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { QuestionDetailModal } from './QuestionDetailModal';
import AnonymousThreadComponent from './AnonymousThread';

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

interface Answer {
  id: string;
  content: string;
  isExpert: boolean;
  expertTitle?: string;
  upvotes: number;
  timestamp: string;
  isHelpful: boolean;
}

interface QuestionFeedProps {
  filter: 'recent' | 'trending' | 'unanswered' | 'expert';
}

// Sample Thread Story - Convert to Question format with thread metadata
const SAMPLE_THREAD_QUESTION = {
  id: 'thread-1',
  question: "My 3-year-old has been having meltdowns every morning when getting ready for daycare. I've tried different approaches but nothing seems to work. How can I make mornings less stressful for both of us?",
  category: 'parenting',
  tags: ['toddler', 'behavior', 'daycare', 'morning-routine'],
  timestamp: '2 hours ago',
  answerCount: 8,
  upvotes: 24,
  isUrgent: false,
  hasExpertAnswer: true,
  isThread: true, // New property to identify threads
  threadUpdates: 3, // Number of updates
  lastUpdate: '30 minutes ago',
  threadData: {
    canContinue: true,
    updates: [
      {
        id: 'update-1',
        content: "Update: I tried the visual schedule suggestion and it's been 3 days now. There's been some improvement! She seems to like checking off the pictures. Still some resistance with getting dressed though. Should I add a reward system?",
        timestamp: '6 hours ago',
        upvotes: 8,
        isOriginalPoster: true
      },
      {
        id: 'update-2', 
        content: "Day 7 update: The visual schedule is working great! I added stickers as rewards and now she actually looks forward to morning routine. The key was letting her put the stickers on herself. Thanks everyone for the advice! 🙏",
        timestamp: '2 hours ago',
        upvotes: 15,
        isOriginalPoster: true
      },
      {
        id: 'update-3',
        content: "Week 3 check-in: We've had such a transformation! Mornings are actually peaceful now. She even helps pack her daycare bag. The routine has become a bonding time for us. Amazing how small changes can make such a big difference.",
        timestamp: '30 minutes ago',
        upvotes: 22,
        isOriginalPoster: true
      }
    ]
  },
  answers: [
    {
      id: 'a1',
      content: "I had the same issue with my daughter. What worked was creating a morning checklist with pictures and letting her pick out her clothes the night before. It gave her some control and reduced the resistance.",
      isExpert: false,
      upvotes: 12,
      timestamp: '1 hour ago',
      isHelpful: true
    },
    {
      id: 'a2',
      content: "As a child psychologist, I recommend implementing a visual schedule with clear expectations. Toddlers thrive on routine and predictability. Also, consider if there are any sensory issues with clothing or if your child needs more transition time.",
      isExpert: true,
      expertTitle: 'Child Psychologist',
      upvotes: 18,
      timestamp: '30 minutes ago',
      isHelpful: true
    }
  ]
};

// Mock data
const MOCK_QUESTIONS: Question[] = [
  SAMPLE_THREAD_QUESTION, // Replace first question with our sample thread
  {
    id: '2',
    question: "My 3-year-old has been having meltdowns every morning when getting ready for daycare. I've tried different approaches but nothing seems to work. How can I make mornings less stressful for both of us?",
    category: 'parenting',
    tags: ['toddler', 'behavior', 'daycare', 'morning-routine'],
    timestamp: '2 hours ago',
    answerCount: 8,
    upvotes: 24,
    isUrgent: false,
    hasExpertAnswer: true,
    aiResponse: "Morning transitions can be challenging for toddlers. Consider creating a visual schedule, allowing extra time, and establishing a consistent routine.",
    answers: [
      {
        id: 'a1',
        content: "I had the same issue with my daughter. What worked was creating a morning checklist with pictures and letting her pick out her clothes the night before. It gave her some control and reduced the resistance.",
        isExpert: false,
        upvotes: 12,
        timestamp: '1 hour ago',
        isHelpful: true
      },
      {
        id: 'a2',
        content: "As a child psychologist, I recommend implementing a visual schedule with clear expectations. Toddlers thrive on routine and predictability. Also, consider if there are any sensory issues with clothing or if your child needs more transition time.",
        isExpert: true,
        expertTitle: 'Child Psychologist',
        upvotes: 18,
        timestamp: '30 minutes ago',
        isHelpful: true
      }
    ]
  },
    {
      id: '3',
      question: "I'm feeling overwhelmed as a new mom. Everyone seems to have it together except me. Is it normal to feel like I'm failing at everything?",
      category: 'mental-health',
      tags: ['new-mom', 'anxiety', 'overwhelmed', 'postpartum'],
      timestamp: '4 hours ago',
      answerCount: 15,
      upvotes: 45,
      isUrgent: true,
      hasExpertAnswer: true,
      aiResponse: "What you're experiencing is very common and normal. Many new mothers feel overwhelmed. It's important to reach out for support and remember that asking for help is a sign of strength.",
      answers: []
    },
    {
      id: '4',
    question: "How do I balance working from home with a 1-year-old? I feel guilty not giving my full attention to either work or my baby.",
    category: 'career',
    tags: ['work-life-balance', 'working-mom', 'guilt', 'toddler'],
    timestamp: '6 hours ago',
    answerCount: 6,
    upvotes: 19,
    isUrgent: false,
    hasExpertAnswer: false,
    answers: []
  },
  {
    id: '4',
    question: "My teenager has been very withdrawn lately and I'm worried about depression. How do I approach this sensitive topic without pushing them away?",
    category: 'mental-health',
    tags: ['teenager', 'depression', 'communication', 'mental-health'],
    timestamp: '8 hours ago',
    answerCount: 12,
    upvotes: 32,
    isUrgent: false,
    hasExpertAnswer: true,
    answers: []
  },
  {
    id: '5',
    question: "Is it normal for my 5-year-old to still wet the bed occasionally? Should I be concerned or is this just part of development?",
    category: 'parenting',
    tags: ['bedwetting', 'development', 'preschooler'],
    timestamp: '12 hours ago',
    answerCount: 0,
    upvotes: 8,
    isUrgent: false,
    hasExpertAnswer: false,
    answers: []
  }
];

export const QuestionFeed: React.FC<QuestionFeedProps> = ({ filter }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const getFilteredQuestions = () => {
    switch (filter) {
      case 'trending':
        return MOCK_QUESTIONS.sort((a, b) => b.upvotes - a.upvotes);
      case 'unanswered':
        return MOCK_QUESTIONS.filter(q => q.answerCount === 0);
      case 'expert':
        return MOCK_QUESTIONS.filter(q => q.hasExpertAnswer);
      case 'recent':
      default:
        return MOCK_QUESTIONS;
    }
  };

  const filteredQuestions = getFilteredQuestions();

  if (filteredQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">💭</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No questions found
        </h3>
        <p className="text-muted-foreground text-sm">
          {filter === 'unanswered' 
            ? "All questions have been answered!" 
            : "Be the first to ask a question in this category."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onClick={() => setSelectedQuestion(question)}
          />
        ))}
      </div>

      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </>
  );
};
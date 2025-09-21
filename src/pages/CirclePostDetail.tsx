import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Crown, Lock, Sparkles, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TipButton } from '@/components/circles/TipButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PersistentCommentComposer } from '@/components/PersistentCommentComposer';
import FooterNav from '@/components/FooterNav';
import { cn } from '@/lib/utils';
import { type TabKey } from '@/hooks/useAppNav';

interface CirclePost {
  id: string;
  author: {
    name: string;
    avatar: string;
    isOwner: boolean;
  };
  title: string;
  content: string;
  fullContent?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tips: number;
  image: string;
  isPremium: boolean;
}

const mockPosts: Record<string, CirclePost> = {
  '1': {
    id: '1',
    author: {
      name: 'Circle Owner',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      isOwner: true
    },
    title: 'New Product Feature Launch',
    content: 'Excited to announce our latest innovation! We\'re looking for beta testers from our amazing community to help us perfect this feature.',
    fullContent: 'Excited to announce our latest innovation! We\'re looking for beta testers from our amazing community to help us perfect this feature.\n\nThis groundbreaking feature represents months of research and development. Our team has been working tirelessly to create something that will revolutionize how our community interacts and engages.\n\nKey highlights of this new feature:\n• Enhanced user experience with intuitive design\n• Advanced analytics and insights\n• Seamless integration with existing tools\n• Mobile-first approach for better accessibility\n• Real-time collaboration capabilities\n\nWe believe this feature will significantly improve productivity and user satisfaction. The beta testing phase will help us identify any potential issues and gather valuable feedback from our most engaged users.\n\nIf you\'re interested in becoming a beta tester, please reach out to our team. We\'re looking for users who are active in the community and can provide constructive feedback.',
    timestamp: '2h',
    likes: 128,
    comments: 34,
    shares: 12,
    tips: 23,
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
    isPremium: true
  },
  '2': {
    id: '2',
    author: {
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      isOwner: false
    },
    title: 'Networking Event Success',
    content: 'What an incredible evening! Thank you to everyone who joined our networking event. The connections made were truly inspiring.',
    fullContent: 'What an incredible evening! Thank you to everyone who joined our networking event. The connections made were truly inspiring.\n\nThe event brought together over 150 professionals from various industries, creating an amazing atmosphere of collaboration and innovation. We witnessed some fantastic conversations and saw many potential partnerships forming.\n\nEvent highlights:\n• 150+ attendees from diverse backgrounds\n• 3 keynote speakers sharing industry insights\n• Interactive workshops and breakout sessions\n• Networking reception with local cuisine\n• Live music and entertainment\n\nThe feedback has been overwhelmingly positive, with many attendees already planning follow-up meetings and collaborations. This is exactly what we hoped to achieve - bringing our community together and fostering meaningful connections.\n\nWe\'re already planning our next event based on your suggestions. Stay tuned for more details!',
    timestamp: '5h',
    likes: 89,
    comments: 23,
    shares: 8,
    tips: 15,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
    isPremium: false
  }
};

const mockComments = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', initials: 'SJ' },
    content: 'This is exactly what I was looking for! Thanks for sharing.',
    time: '2h',
    likes: 12
  },
  {
    id: '2', 
    user: { name: 'Mike Chen', initials: 'MC' },
    content: 'Great insights! Would love to see more content like this.',
    time: '4h',
    likes: 8
  },
  {
    id: '3',
    user: { name: 'Emma Davis', initials: 'ED' },
    content: 'Thanks for the detailed breakdown. Very helpful!',
    time: '6h',
    likes: 5
  }
];

const CommentItem: React.FC<{ comment: any }> = ({ comment }) => {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-b-0">
      <div className="size-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
        {comment.user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">{comment.time}</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="size-3" />
            {comment.likes}
          </button>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

const PremiumSubscriptionBanner: React.FC<{ onSubscribe: () => void }> = ({ onSubscribe }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-tertiary/50 to-tertiary/80 dark:from-primary/20 dark:to-primary/10 border border-tertiary dark:border-primary p-6 my-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-gradient-primary shadow-glow">
            <Crown className="size-5 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Premium Content</h3>
        </div>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Unlock the full article and access exclusive premium content from circle creators. Get unlimited access to all premium posts, early content previews, and direct creator interactions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onSubscribe}
            className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground border-0 shadow-glow hover:shadow-xl transition-all duration-200"
          >
            <Sparkles className="size-4 mr-2" />
            Subscribe Now
          </Button>
          <Button variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/5">
            Learn More
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>✓ All premium content</span>
          <span>✓ Early access</span>
          <span>✓ Creator interactions</span>
        </div>
      </div>
    </div>
  );
};

const CirclePostDetail: React.FC = () => {
  const { circleId, postId } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [comments, setComments] = useState(mockComments);
  const contentRef = useRef<HTMLDivElement>(null);

  console.log('Route params:', { circleId, postId });
  console.log('Available posts:', Object.keys(mockPosts));
  const post = mockPosts[postId || '1'];
  console.log('Found post:', post);

  useEffect(() => {
    if (!post) {
      console.log('Post not found');
      return;
    }
    
    console.log('Post data:', { isPremium: post?.isPremium, hasSubscription, shouldShowPaywall: post?.isPremium && !hasSubscription });
  }, [post?.isPremium, hasSubscription]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/circle/${circleId}`)}>
            Back to Circle
          </Button>
        </div>
      </div>
    );
  }

  const handleSubscribe = () => {
    setHasSubscription(true);
  };

  const getDisplayContent = () => {
    if (!post?.isPremium || hasSubscription) {
      return post?.fullContent || post?.content;
    }
    
    // For premium posts without subscription, show first two paragraphs
    const fullContent = post?.fullContent || post?.content;
    const paragraphs = fullContent.split('\n\n');
    if (paragraphs.length <= 2) {
      return fullContent;
    }
    
    // Return first two paragraphs
    return paragraphs.slice(0, 2).join('\n\n');
  };

  const shouldShowPaywall = post?.isPremium && !hasSubscription;

  const handleCommentSubmit = (commentText: string) => {
    const newComment = {
      id: Date.now().toString(),
      user: { name: 'You', initials: 'ME' },
      content: commentText,
      time: 'now',
      likes: 0
    };
    setComments([newComment, ...comments]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(`/circle/${circleId}`)}
            className="p-2 bg-background hover:bg-background rounded-full transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <h1 className="font-semibold text-lg">Post</h1>
            {post?.isPremium && (
              <Crown className="size-4 text-primary" />
            )}
          </div>
          <button className="p-2 bg-background hover:bg-background rounded-full transition-colors">
            <MoreHorizontal className="size-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="max-w-3xl mx-auto">
          {/* Hero Image */}
          {post?.image && (
            <div className="mb-6 relative">
              <img
                src={post.image}
                alt={post?.title || 'Post image'}
                className="w-full h-64 md:h-80 object-cover rounded-2xl"
              />
              {post?.isPremium && (
                <div className="absolute top-4 right-4 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-glow">
                  Premium
                </div>
              )}
            </div>
          )}

          {/* Post Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* Author info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="size-12">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{post.author.name}</span>
                  {post.author.isOwner && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
              </div>
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isBookmarked ? "bg-primary text-primary-foreground" : "bg-background hover:bg-background"
                )}
              >
                <Bookmark className="size-5" />
              </button>
            </div>

            {/* Interaction buttons */}
            <div className="flex items-center gap-6 py-4 border-y border-border">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart className={cn("size-5", isLiked && "fill-current")} />
                <span className="text-sm">{post.likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="size-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="size-5" />
                <span className="text-sm">{post.shares}</span>
              </button>

              <TipButton
                postId={postId!}
                authorName={post.author.name}
                tipCount={post.tips || 0}
                userHasTipped={false}
                onTip={(amount) => console.log(`Tipped $${amount} to ${post.author.name}`)}
              />
            </div>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-8 relative">
            {/* First two paragraphs - always visible */}
            <div className="text-foreground leading-relaxed text-base whitespace-pre-line">
              {getDisplayContent()}
            </div>
            
            {shouldShowPaywall && (
              <>
                {/* Fade overlay starting after second paragraph */}
                <div className="relative mt-8">
                  <div 
                    className="text-foreground leading-relaxed text-base whitespace-pre-line transition-all duration-500"
                    style={{
                      opacity: 0.3,
                      filter: 'blur(1px)'
                    }}
                  >
                    {/* Show remaining content faded */}
                    {(() => {
                      const fullContent = post?.fullContent || post?.content;
                      const paragraphs = fullContent.split('\n\n');
                      if (paragraphs.length > 2) {
                        return paragraphs.slice(2).join('\n\n');
                      }
                      return '';
                    })()}
                  </div>
                  
                  {/* Gradient overlay and subscription banner */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-auto pt-12">
                      <div className="max-w-md mx-auto px-4">
                        <PremiumSubscriptionBanner onSubscribe={handleSubscribe} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Show full content if subscribed */}
            {!shouldShowPaywall && (post?.fullContent || post?.content) !== getDisplayContent() && (
              <div className="text-foreground leading-relaxed text-base whitespace-pre-line mt-8">
                {(() => {
                  const fullContent = post?.fullContent || post?.content;
                  const paragraphs = fullContent.split('\n\n');
                  if (paragraphs.length > 2) {
                    return paragraphs.slice(2).join('\n\n');
                  }
                  return '';
                })()}
              </div>
            )}
          </div>

          {/* Comments Section */}
          {!shouldShowPaywall && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Comments ({comments.length})
              </h2>
              
              {/* Comments list */}
              {comments.length > 0 ? (
                <div className="space-y-0">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </article>
      </main>
      
      {/* Persistent Comment Composer */}
      {!shouldShowPaywall && (
        <PersistentCommentComposer onSubmit={handleCommentSubmit} />
      )}

      <FooterNav 
        active="circles"
        onSelect={() => {}} // Navigation handled by FooterNav directly
        onOpenCreate={() => {}}
      />
    </div>
  );
};

export default CirclePostDetail;
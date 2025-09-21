import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Send } from 'lucide-react';
import { MOCK_POSTS } from '@/data/mock';
import { Button } from '@/components/ui/button';

import { PersistentCommentComposer } from '@/components/PersistentCommentComposer';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface Comment {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarColor: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  parentId?: string;
}

const sampleComments: Comment[] = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', initials: 'SJ', avatarColor: '#8B5CF6' },
    text: 'This is such a great post! Really helpful information.',
    timestamp: '2h',
    likes: 12,
    replies: 2,
    isLiked: false,
  },
  {
    id: '2',
    user: { name: 'Mike Chen', initials: 'MC', avatarColor: '#10B981', verified: true },
    text: 'I completely agree with this perspective. Thanks for sharing!',
    timestamp: '1h',
    likes: 8,
    replies: 0,
    isLiked: true,
  },
  {
    id: '3',
    user: { name: 'Emma Davis', initials: 'ED', avatarColor: '#F59E0B' },
    text: 'Could you share more details about this? I\'d love to learn more.',
    timestamp: '45m',
    likes: 5,
    replies: 1,
    isLiked: false,
  },
];

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "m";
};

const formatRelativeTime = (iso: string) => {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
};

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();
  
  const [comments, setComments] = useState(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Find the post by ID (in a real app, this would come from an API)
  const post = MOCK_POSTS.find(p => p.id === Number(postId));
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Post not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            Go back to feed
          </Button>
        </div>
      </div>
    );
  }

  const handleCommentSubmit = (commentText: string) => {
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        initials: 'YU',
        avatarColor: '#E08ED1',
      },
      text: commentText,
      timestamp: 'now',
      likes: 0,
      replies: 0,
      isLiked: false,
    };
    setComments(prev => [comment, ...prev]);
    triggerHaptic('light');
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
    triggerHaptic('light');
  };

  const handleLikePost = () => {
    setLiked(!liked);
    triggerHaptic('light');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2 h-auto"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-foreground">{post.user.name}</h1>
          <p className="text-sm text-muted-foreground">Post</p>
        </div>
      </header>

      {/* Post Content */}
      <main className="flex-1 flex flex-col">
        <article className="bg-white border-b border-gray-100">
          {/* Post Header */}
          <div className="p-4 flex items-center gap-3">
            <div 
              className="size-10 rounded-full grid place-items-center text-sm font-medium text-white"
              style={{ backgroundColor: post.user.avatarColor }}
            >
              {post.user.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-foreground">
                  {post.user.name}
                </h3>
                {post.user.verified && (
                  <BadgeCheck className="size-4 text-secondary" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatRelativeTime(post.time)}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="text-foreground leading-relaxed mb-3">
              {post.content}
            </p>
            
            {post.tags && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-subtle text-primary border border-primary/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Media */}
          {post.media && (
            <div className="px-0">
              <div 
                className="relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${post.media.colorFrom || '#FEDAF7'}, ${post.media.colorTo || '#E08ED1'})` }}
              >
                {post.media.url ? (
                  <img 
                    src={post.media.url} 
                    alt={post.media.alt || ""} 
                    className="w-full h-64 object-cover" 
                  />
                ) : (
                  <div className="h-64 w-full" />
                )}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="px-4 py-3 flex items-center gap-6 border-t border-gray-50">
            <button
              onClick={handleLikePost}
              className="flex items-center gap-2 text-sm font-medium hover:text-red-500 transition-colors"
            >
              <Heart 
                className={`size-5 transition-all ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
              <span>{formatCount((post.stats.likes || 0) + (liked ? 1 : 0))}</span>
            </button>
            
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="size-5" />
              <span>{formatCount(post.stats.comments + comments.length)}</span>
            </button>
            
            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
              <Share2 className="size-5" />
              <span>{formatCount(post.stats.shares)}</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="flex-1 bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-foreground">
              {formatCount(comments.length)} Comments
            </h2>
          </div>

          {/* Comments List */}
          <div className="flex-1 pb-20">
            {comments.map((comment) => (
              <div key={comment.id} className="px-4 py-3 border-b border-gray-50">
                <div className="flex gap-3">
                  <div 
                    className="size-8 rounded-full grid place-items-center text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: comment.user.avatarColor }}
                  >
                    {comment.user.initials}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {comment.user.name}
                      </span>
                      {comment.user.verified && (
                        <BadgeCheck className="size-3 text-secondary" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-2">
                      {comment.text}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-xs font-medium hover:text-red-500 transition-colors"
                      >
                        <Heart className={`size-3 ${comment.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                      </button>
                      
                      <button className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                        Reply
                        {comment.replies > 0 && <span className="ml-1">({comment.replies})</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Comment Input */}
      <PersistentCommentComposer onSubmit={handleCommentSubmit} />
    </div>
  );
};

export default PostDetail;
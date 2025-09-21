import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, MessageCircle, Share, Send } from 'lucide-react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarColor: string;
    verified?: boolean;
  };
  text: string;
  likes: number;
  replies: number;
  timestamp: string;
  isLiked?: boolean;
  parentId?: string; // For replies
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  totalComments: number;
  onHeightChange?: (height: number) => void;
}

const sampleComments: Comment[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      initials: 'SJ',
      avatarColor: '#FF6B6B',
      verified: true
    },
    text: 'This is absolutely amazing! Love the creativity 😍',
    likes: 234,
    replies: 12,
    timestamp: '2h',
    isLiked: true
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      initials: 'MC',
      avatarColor: '#4ECDC4'
    },
    text: 'How did you even think of this? Mind blown! 🤯',
    likes: 89,
    replies: 5,
    timestamp: '4h'
  },
  {
    id: '3',
    user: {
      name: 'Alex Rivera',
      initials: 'AR',
      avatarColor: '#45B7D1'
    },
    text: 'Tutorial please! Need to learn this technique',
    likes: 156,
    replies: 23,
    timestamp: '6h'
  },
  {
    id: '4',
    user: {
      name: 'Emma Wilson',
      initials: 'EW',
      avatarColor: '#96CEB4',
      verified: true
    },
    text: 'Been following you for months and this is your best work yet! Keep it up 🔥',
    likes: 445,
    replies: 34,
    timestamp: '8h',
    isLiked: true
  },
  {
    id: '5',
    user: {
      name: 'David Kim',
      initials: 'DK',
      avatarColor: '#FFEAA7'
    },
    text: 'The attention to detail is incredible',
    likes: 67,
    replies: 8,
    timestamp: '12h'
  },
  {
    id: '6',
    user: {
      name: 'Lisa Park',
      initials: 'LP',
      avatarColor: '#FF8B94'
    },
    text: 'This made my day! Thank you for sharing 💕',
    likes: 203,
    replies: 7,
    timestamp: '14h'
  },
  {
    id: '7',
    user: {
      name: 'James Wright',
      initials: 'JW',
      avatarColor: '#A8E6CF',
      verified: true
    },
    text: 'Professional level work right here! Inspired 🙌',
    likes: 512,
    replies: 28,
    timestamp: '16h',
    isLiked: true
  },
  {
    id: '8',
    user: {
      name: 'Maria Garcia',
      initials: 'MG',
      avatarColor: '#FFD93D'
    },
    text: 'Can you do a live session showing this technique?',
    likes: 89,
    replies: 15,
    timestamp: '18h'
  },
  {
    id: '9',
    user: {
      name: 'Tom Anderson',
      initials: 'TA',
      avatarColor: '#A8DADC'
    },
    text: 'This is exactly what I needed to see today! Motivational ✨',
    likes: 134,
    replies: 4,
    timestamp: '20h'
  },
  {
    id: '10',
    user: {
      name: 'Nina Rodriguez',
      initials: 'NR',
      avatarColor: '#F1C0E8',
      verified: true
    },
    text: 'Your consistency in quality content is unmatched! Love following your journey',
    likes: 378,
    replies: 19,
    timestamp: '22h'
  },
  {
    id: '11',
    user: {
      name: 'Chris Taylor',
      initials: 'CT',
      avatarColor: '#CFBAF0'
    },
    text: 'Wow, the timing on this is perfect! 🎯',
    likes: 45,
    replies: 2,
    timestamp: '1d'
  },
  {
    id: '12',
    user: {
      name: 'Amanda Lee',
      initials: 'AL',
      avatarColor: '#B4F8C8'
    },
    text: 'I keep coming back to watch this. So good!',
    likes: 67,
    replies: 0,
    timestamp: '1d'
  },
  {
    id: '13',
    user: {
      name: 'Ryan Murphy',
      initials: 'RM',
      avatarColor: '#FBE7C6'
    },
    text: 'This should be trending everywhere! Share this people 📢',
    likes: 156,
    replies: 11,
    timestamp: '1d'
  },
  {
    id: '14',
    user: {
      name: 'Sophie Chen',
      initials: 'SC',
      avatarColor: '#FFAAA5',
      verified: true
    },
    text: 'Teaching my students this technique tomorrow! Thanks for the inspiration 📚',
    likes: 289,
    replies: 25,
    timestamp: '1d'
  },
  {
    id: '15',
    user: {
      name: 'Kevin Johnson',
      initials: 'KJ',
      avatarColor: '#FF6B9D'
    },
    text: 'The way you break down complex concepts is amazing',
    likes: 123,
    replies: 6,
    timestamp: '2d'
  },
  {
    id: '16',
    user: {
      name: 'Rachel Smith',
      initials: 'RS',
      avatarColor: '#C7CEEA'
    },
    text: 'Been waiting for content like this! You never disappoint 🎉',
    likes: 78,
    replies: 3,
    timestamp: '2d'
  },
  {
    id: '17',
    user: {
      name: 'Daniel Brown',
      initials: 'DB',
      avatarColor: '#FFD1DC'
    },
    text: 'This is art! Pure creativity and skill combined 🎨',
    likes: 201,
    replies: 8,
    timestamp: '2d'
  },
  {
    id: '18',
    user: {
      name: 'Jessica Williams',
      initials: 'JW',
      avatarColor: '#E0BBE4'
    },
    text: 'My favorite creator on this platform! Keep being awesome ⭐',
    likes: 167,
    replies: 12,
    timestamp: '2d'
  },
  {
    id: '19',
    user: {
      name: 'Mark Davis',
      initials: 'MD',
      avatarColor: '#957DAD'
    },
    text: 'The production quality keeps getting better! What camera setup do you use?',
    likes: 89,
    replies: 14,
    timestamp: '3d'
  },
  {
    id: '20',
    user: {
      name: 'Ashley Martinez',
      initials: 'AM',
      avatarColor: '#D291BC',
      verified: true
    },
    text: 'This is going straight into my inspiration folder! Absolutely brilliant work 💎',
    likes: 445,
    replies: 31,
    timestamp: '3d',
    isLiked: true
  }
];

const formatCount = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  totalComments,
  onHeightChange
}) => {
  const [comments, setComments] = useState(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const DISMISS_THRESHOLD = 80; // Reduced threshold for easier dismissal
  const SPRING_BACK_THRESHOLD = 40; // Lower threshold for showing dismiss hint

  // Enhanced swipe gestures for smooth dismiss
  const swipeHandlers = useSwipeGestures({
    onSwipeDown: () => {
      // Only trigger if not scrolling content
      if (!isScrollAtTop()) return;
      handleClose();
    },
  }, { 
    threshold: 100 
  });

  const isScrollAtTop = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return true;
    return scrollArea.scrollTop <= 0;
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setDragOffset(0);
    }, 200);
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
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          initials: 'YU',
          avatarColor: '#667EEA'
        },
        text: newComment.trim(),
        likes: 0,
        replies: 0,
        timestamp: 'now'
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleAddReply = (parentId: string) => {
    if (replyText.trim()) {
      const reply: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          initials: 'YU',
          avatarColor: '#667EEA'
        },
        text: replyText.trim(),
        likes: 0,
        replies: 0,
        timestamp: 'now',
        parentId
      };
      setComments(prev => [reply, ...prev]);
      setReplyText('');
      setReplyingTo(null);
      
      // Update reply count
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: comment.replies + 1 }
          : comment
      ));
    }
  };

  // Enhanced touch handlers for smooth drag-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow dragging from header or when scroll is at top
    const target = e.target as HTMLElement;
    const isHeader = target.closest('[data-modal-header]');
    
    if (!isHeader && !isScrollAtTop()) return;
    
    // Prevent any default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setDragOffset(0);
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Always prevent default and stop propagation to avoid page refresh
    e.preventDefault();
    e.stopPropagation();
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward movement
    if (deltaY < 0) return;
    
    // Improved resistance curve - less resistance for easier dismissal
    let adjustedOffset = deltaY;
    
    // Apply gentle resistance only after threshold to maintain natural feel
    if (deltaY > DISMISS_THRESHOLD) {
      const excessDrag = deltaY - DISMISS_THRESHOLD;
      const resistance = Math.max(0.3, 1 - (excessDrag / 100)); // Gentler resistance
      adjustedOffset = DISMISS_THRESHOLD + (excessDrag * resistance);
    }
    
    setDragOffset(adjustedOffset);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    // Prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    console.log('Touch end - dragOffset:', dragOffset, 'threshold:', DISMISS_THRESHOLD);
    
    if (dragOffset >= DISMISS_THRESHOLD) { // Changed to >= for easier dismissal
      // Close modal with animation
      console.log('Closing modal');
      handleClose();
    } else {
      // Spring back to original position
      console.log('Springing back');
      setDragOffset(0);
    }
  };

  // Mouse handlers for desktop support
  const handleMouseStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isHeader = target.closest('[data-modal-header]');
    
    if (!isHeader && !isScrollAtTop()) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setStartY(e.clientY);
    setDragOffset(0);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const currentY = e.clientY;
      const deltaY = currentY - startY;
      
      if (deltaY < 0) return;
      
      // Same improved resistance curve for mouse
      let adjustedOffset = deltaY;
      
      if (deltaY > DISMISS_THRESHOLD) {
        const excessDrag = deltaY - DISMISS_THRESHOLD;
        const resistance = Math.max(0.3, 1 - (excessDrag / 100));
        adjustedOffset = DISMISS_THRESHOLD + (excessDrag * resistance);
      }
      
      setDragOffset(adjustedOffset);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      
      if (dragOffset >= DISMISS_THRESHOLD) { // Changed to >= for easier dismissal
        handleClose();
      } else {
        setDragOffset(0);
      }
    };

    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (!isDragging) return;
      
      // Always prevent default to stop pull-to-refresh
      e.preventDefault();
      e.stopPropagation();
      
      if (e.touches.length === 0) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY < 0) return;
      
      // Same improved resistance curve
      let adjustedOffset = deltaY;
      
      if (deltaY > DISMISS_THRESHOLD) {
        const excessDrag = deltaY - DISMISS_THRESHOLD;
        const resistance = Math.max(0.3, 1 - (excessDrag / 100));
        adjustedOffset = DISMISS_THRESHOLD + (excessDrag * resistance);
      }
      
      setDragOffset(adjustedOffset);
    };

    const handleTouchEndGlobal = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      if (dragOffset >= DISMISS_THRESHOLD) { // Changed to >= for easier dismissal
        handleClose();
      } else {
        setDragOffset(0);
      }
    };

    // Add event listeners with passive: false to ensure preventDefault works
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    document.addEventListener('touchend', handleTouchEndGlobal, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
      
      // Cleanup body styles
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging, startY, dragOffset]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setDragOffset(0);
      setIsDragging(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dismissProgress = Math.min(1, dragOffset / DISMISS_THRESHOLD);
  const opacity = 1 - (dismissProgress * 0.3);
  const scale = 1 - (dismissProgress * 0.05);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-background transition-all duration-300 no-pull-refresh",
        isClosing && "animate-fade-out"
      )}
      style={{
        transform: `translateY(${dragOffset}px)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        touchAction: 'none', // Prevent pull-to-refresh
        overscrollBehavior: 'none' // Prevent overscroll effects
      }}
    >
      {/* Modal positioned fullscreen */}
      <div 
        ref={modalRef}
        className={cn(
          "flex flex-col h-full bg-background overflow-hidden",
          isDragging && "select-none"
        )}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          touchAction: 'none', // Prevent any touch actions
          overscrollBehavior: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseStart}
      >
        {/* Drag indicator */}
        {dragOffset > SPRING_BACK_THRESHOLD && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
            <div className={cn(
              "w-12 h-1 rounded-full transition-all duration-200",
              dragOffset > DISMISS_THRESHOLD 
                ? "bg-red-500 shadow-red-500/50 shadow-lg" 
                : "bg-muted-foreground/30"
            )}>
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, (dragOffset / DISMISS_THRESHOLD) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-center mt-1 text-muted-foreground">
              {dragOffset > DISMISS_THRESHOLD ? 'Release to close' : 'Pull to close'}
            </div>
          </div>
        )}

        {/* Header */}
        <div 
          data-modal-header
          className="flex items-center justify-between px-4 py-4 border-b border-border cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {formatCount(totalComments)} comments
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-background hover:bg-background rounded-full transition-colors"
            aria-label="Close comments"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="px-4 py-2 space-y-4">
            {comments.filter(comment => !comment.parentId).map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main comment */}
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div 
                    className="size-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: comment.user.avatarColor }}
                  >
                    {comment.user.initials}
                  </div>

                  {/* Comment content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user.name}
                      </span>
                      {comment.user.verified && (
                        <div className="size-3 bg-primary rounded-full flex items-center justify-center">
                          <div className="size-1.5 bg-white rounded-full" />
                        </div>
                      )}
                      <span className="text-xs text-gray-500 ml-1">
                        {comment.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                      {comment.text}
                    </p>

                    {/* Comment actions */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Heart className={`size-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes > 0 && <span>{formatCount(comment.likes)}</span>}
                      </button>
                      
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        <MessageCircle className="size-3" />
                        {comment.replies > 0 && <span>{comment.replies}</span>}
                      </button>
                      
                      <button 
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply input for this comment */}
                {replyingTo === comment.id && (
                  <div className="ml-11 mt-3">
                    <div className="flex items-end gap-3 bg-background border border-border rounded-2xl p-3 shadow-lg">
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.user.name}...`}
                          className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none resize-none min-h-[24px] leading-6"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddReply(comment.id);
                            }
                            if (e.key === 'Escape') {
                              setReplyingTo(null);
                              setReplyText('');
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      {replyText.trim() && (
                        <Button
                          onClick={() => handleAddReply(comment.id)}
                          size="sm"
                          className="px-3 py-2 h-8 bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-glow"
                        >
                          <Send className="size-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                 {/* Show replies */}
                {comments.filter(reply => reply.parentId === comment.id).map((reply) => (
                  <div key={reply.id} className="ml-11 flex gap-3">
                    <div 
                      className="size-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: reply.user.avatarColor }}
                    >
                      {reply.user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {reply.user.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          {reply.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1 leading-relaxed">
                        {reply.text}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeComment(reply.id)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            reply.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Heart className={`size-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                          {reply.likes > 0 && <span>{formatCount(reply.likes)}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            </div>
          </ScrollArea>
        </div>

        {/* Comment input - sticky at bottom */}
        <div className="sticky bottom-0">
          <div className="px-4 py-3">
            <div className="flex items-end gap-3 bg-background border border-border rounded-2xl p-3 shadow-lg">
              <div className="size-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground flex-shrink-0">
                YU
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none resize-none min-h-[24px] leading-6"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
              </div>
              {newComment.trim() && (
                <Button
                  onClick={handleAddComment}
                  size="sm"
                  className="px-3 py-2 h-8 bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-glow"
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
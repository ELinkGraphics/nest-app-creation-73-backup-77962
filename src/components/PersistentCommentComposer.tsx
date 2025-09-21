import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import anonymousLogo from '@/assets/anonymous-logo.png';

interface PersistentCommentComposerProps {
  onSubmit: (comment: string) => void;
  placeholder?: string;
}

export const PersistentCommentComposer: React.FC<PersistentCommentComposerProps> = ({
  onSubmit,
  placeholder = "Add a comment..."
}) => {
  const [comment, setComment] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea up to 4 lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = 24; // Approximate line height
    const maxHeight = lineHeight * 4; // 4 lines max
    
    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  }, [comment]);

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
      textareaRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Safe area padding for mobile devices */}
      <div className="pb-safe">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-background border border-border rounded-2xl p-3 shadow-lg">
              {/* Anonymous user profile */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <img 
                  src={anonymousLogo} 
                  alt="Anonymous Asker" 
                  className="size-8 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                  Anonymous Asker
                </span>
              </div>
              
              {/* Comment input */}
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none resize-none min-h-[24px] leading-6"
                  rows={1}
                />
              </div>
              
              {/* Send button */}
              <Button
                onClick={handleSubmit}
                disabled={!comment.trim()}
                size="sm"
                className={cn(
                  "px-3 py-2 h-8 transition-all duration-200",
                  comment.trim() 
                    ? "bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-glow" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
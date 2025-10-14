import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '@/data/mock';
import { useUser } from '@/contexts/UserContext';
import { usePostMutations } from '@/hooks/usePostMutations';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
}

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

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1000000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "m";
};

const clampText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + "…";
};

const Avatar = ({ initials, color, verified, avatar }: { 
  initials: string; 
  color: string; 
  verified?: boolean;
  avatar?: string;
}) => (
  <div className="relative">
    <div 
      className="size-8 rounded-full grid place-items-center text-xs font-medium text-white overflow-hidden"
      style={{ background: color }}
    >
      {avatar ? (
        <img src={avatar} alt={initials} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  </div>
);

const MediaBlock = ({ alt, url, from, to, onClick }: { 
  alt?: string; 
  url?: string; 
  from: string; 
  to: string;
  onClick?: () => void;
}) => (
  <div 
    className="relative overflow-hidden group/media cursor-pointer"
    onClick={onClick}
  >
    <div 
      className="rounded-none overflow-hidden relative"
      aria-label={alt}
      role="img"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {url ? (
        <img 
          src={url} 
          alt={alt || ""} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover/media:scale-105" 
          loading="lazy" 
        />
      ) : (
        <div className="h-48 w-full transition-transform duration-500 group-hover/media:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />
    </div>
  </div>
);

const Chip = ({ label }: { label: string }) => (
  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-subtle text-primary border border-primary/20 hover:bg-primary/10 transition-all duration-200 cursor-pointer hover:scale-105">
    {label}
  </span>
);

const ActionButton = ({ icon, label, onClick, active }: { 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void; 
  active?: boolean; 
}) => (
  <button 
    type="button" 
    onClick={onClick} 
    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl hover:bg-muted/30 transition-all duration-200 hover:scale-105 group/action"
  >
    <div className="transition-transform duration-200 group-hover/action:scale-110">
      {React.cloneElement(icon as React.ReactElement, {
        className: `size-4 transition-colors ${active ? 'text-primary' : 'text-muted-foreground group-active/action:text-primary'}`
      })}
    </div>
    <span className={`text-action-label font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </button>
);

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const isTextLong = post.content.length > 120;
  const [liked, setLiked] = useState(post.userHasLiked || false);
  const [likesCount, setLikesCount] = useState(post.stats.likes);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharesCount, setSharesCount] = useState(post.stats.shares);
  const [followState, setFollowState] = useState<'visible' | 'checked' | 'hidden'>('visible');
  const navigate = useNavigate();
  const { user } = useUser();
  const { toggleLike, toggleSave, incrementShare, deletePost } = usePostMutations();

  const relative = formatRelativeTime(post.time);
  const content = expanded ? post.content : clampText(post.content, 140);

  const handleLike = async () => {
    if (!user) return;
    
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    await toggleLike(String(post.id), user.id, liked);
  };

  const handleSave = async () => {
    if (!user) return;
    
    const newSavedState = !saved;
    setSaved(newSavedState);
    
    await toggleSave(String(post.id), user.id, saved);
  };

  const handleShare = async () => {
    setSharesCount(prev => prev + 1);
    await incrementShare(String(post.id));
    
    const postUrl = window.location.origin + `/post/${post.id}`;
    
    // Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          url: postUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleOpenPost = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <article className="mb-0 rounded-none border-b border-gray-100 bg-white overflow-hidden group">
      <header className="p-4 flex items-center gap-3">
        <div className="relative">
          <Avatar 
            initials={post.user.initials} 
            color={post.user.avatarColor} 
            verified={post.user.verified}
            avatar={post.user.avatar}
          />
          {followState !== 'hidden' && (
            <button
              onClick={() => {
                setFollowState('checked');
                setTimeout(() => setFollowState('hidden'), 1500);
              }}
              className="absolute -bottom-1.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200"
              aria-label="Follow user"
            >
              {followState === 'visible' ? (
                <Plus className="w-2.5 h-2.5 text-primary" />
              ) : (
                <Check className="w-2.5 h-2.5 text-green-500" />
              )}
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold truncate text-foreground text-username">
              {post.user.name}
            </h3>
            {post.user.verified && (
              <BadgeCheck className="size-4 text-secondary animate-scale-in" aria-label="Verified" />
            )}
            {post.sponsored && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gradient-subtle text-primary border border-primary/20">
                Sponsored
              </span>
            )}
          </div>
          <div className="text-timestamp text-muted-foreground font-medium">
            {relative}
          </div>
        </div>
        <button className="ml-auto p-2 rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-110 group/btn" aria-label="More options">
          <MoreHorizontal className="size-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
        </button>
      </header>
      
      {post.media && (
        <div className="px-0">
          <MediaBlock 
            alt={post.media.alt} 
            url={post.media.url} 
            from={post.media.colorFrom || '#FEDAF7'} 
            to={post.media.colorTo || '#E08ED1'} 
            onClick={handleOpenPost}
          />
        </div>
      )}
      
      <div className="px-4 pt-3">
        <p className={`text-post-content text-foreground leading-relaxed font-normal ${isTextLong && !expanded ? 'line-clamp-2' : ''}`}>
          {post.content}
        </p>
        {isTextLong && !expanded && (
          <button 
            className="text-primary text-post-content font-semibold hover:text-primary/80 transition-colors mt-1 story-link" 
            onClick={handleOpenPost}
            aria-label={`Read more of ${post.user.name}'s post`}
          >
            Read more
          </button>
        )}
        {post.tags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag, index) => (
              <Chip key={tag} label={`#${tag}`} />
            ))}
          </div>
        )}
      </div>
      
      <footer className="px-2 py-2 grid grid-cols-4 gap-1 border-t border-gray-50 mt-2">
        <ActionButton
          active={liked}
          onClick={handleLike}
          icon={
            <Heart 
              className={`size-4 transition-all duration-300 ${liked ? 'fill-red-500 text-red-500 animate-scale-in' : 'text-muted-foreground'}`} 
            />
          }
          label={formatCount(likesCount)}
        />
        <ActionButton 
          icon={<MessageCircle className="size-4 transition-colors" />} 
          label={formatCount(post.stats.comments)} 
          onClick={handleOpenPost}
        />
        <ActionButton 
          icon={<Share2 className="size-4 transition-colors" />} 
          label={formatCount(sharesCount)}
          onClick={handleShare}
        />
        <ActionButton
          active={saved}
          onClick={handleSave}
          icon={
            <svg className={`size-4 transition-all duration-300 ${saved ? 'fill-primary text-primary animate-scale-in' : 'text-muted-foreground'}`} fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          label="Save"
        />
      </footer>
    </article>
  );
};

export default PostCard;

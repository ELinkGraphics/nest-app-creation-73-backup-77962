import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Plus, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '@/data/mock';
import { useUser } from '@/contexts/UserContext';
import { usePostMutations } from '@/hooks/usePostMutations';
import { useFollowMutations } from '@/hooks/useFollowMutations';
import { toast } from '@/hooks/use-toast';
import PublicProfileModal from '@/components/PublicProfileModal';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageHeights, setImageHeights] = useState<number[]>([]);
  const navigate = useNavigate();
  const { user } = useUser();
  const { toggleLike, toggleSave, incrementShare, deletePost } = usePostMutations();
  const { toggleFollow, checkFollowStatus } = useFollowMutations();

  // Check initial follow status
  useEffect(() => {
    const checkInitialFollowStatus = async () => {
      if (user && post.user.id && user.id !== post.user.id) {
        const following = await checkFollowStatus(post.user.id);
        if (following) {
          setFollowState('hidden');
        }
      }
    };
    checkInitialFollowStatus();
  }, [post.user.id, user, checkFollowStatus]);

  // Track carousel slide changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  const relative = formatRelativeTime(post.time);
  const content = expanded ? post.content : clampText(post.content, 140);

  const DEFAULT_HEIGHT = 192; // h-48 in pixels

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    const img = e.currentTarget;
    const containerWidth = img.parentElement?.clientWidth || window.innerWidth;
    const aspectRatio = img.naturalHeight / img.naturalWidth;
    const calculatedHeight = containerWidth * aspectRatio;
    
    // Only increase height if image is taller than default, otherwise keep default
    const finalHeight = calculatedHeight > DEFAULT_HEIGHT ? calculatedHeight : DEFAULT_HEIGHT;
    
    setImageHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = finalHeight;
      return newHeights;
    });
  };

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
    if (post.circleId) {
      navigate(`/circle/${post.circleId}/post/${post.id}`);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const handleDelete = async () => {
    if (!user || !post.user.id) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(String(post.id), user.id);
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
      window.location.reload();
    }
  };

  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.circleId) {
      navigate(`/circle/${post.circleId}`);
    }
  };

  return (
    <article className="mb-0 rounded-none border-b border-gray-100 bg-white overflow-hidden group">
      <header className="p-4 flex items-center gap-3">
        <div className="relative">
          <Avatar 
            initials={post.circleId ? (post.circleName?.[0] || 'C') : post.user.initials} 
            color={post.circleId ? '#4B164C' : post.user.avatarColor} 
            verified={post.circleId ? false : post.user.verified}
            avatar={post.circleId ? post.circleAvatar : post.user.avatar}
          />
          {!post.circleId && followState !== 'hidden' && user?.id !== post.user.id && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!user) {
                  toast({ title: "Please login to follow users" });
                  return;
                }
                const followed = await toggleFollow(post.user.id || '');
                if (followed) {
                  setFollowState('checked');
                  setTimeout(() => setFollowState('hidden'), 1500);
                }
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
            <h3 
              className="font-semibold truncate text-foreground text-username cursor-pointer hover:underline"
              onClick={post.circleId ? handleCircleClick : (e) => {
                e.stopPropagation();
                setShowProfileModal(true);
              }}
            >
              {post.circleId ? post.circleName : post.user.name}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-auto p-2 rounded-full hover:bg-muted/50 transition-all duration-200 hover:scale-110 group/btn" aria-label="More options">
              <MoreHorizontal className="size-4 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user?.id === post.user.id && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="size-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      
      {post.media && post.media.urls && post.media.urls.length > 0 ? (
        <div className="px-0 relative">
          <Carousel className="w-full" setApi={setCarouselApi}>
            <CarouselContent>
              {post.media.urls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative overflow-hidden cursor-pointer" onClick={handleOpenPost}>
                    <img 
                      src={url} 
                      alt={`${post.media?.alt || 'Post image'} ${index + 1}`}
                      className="w-full object-cover" 
                      style={{ height: imageHeights[index] ? `${imageHeights[index]}px` : '192px' }}
                      loading="lazy"
                      onLoad={(e) => handleImageLoad(e, index)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          {post.media.urls.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {post.media.urls.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'bg-white w-2' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : post.media && post.media.url ? (
        <div className="px-0">
          <div 
            className="relative overflow-hidden group/media cursor-pointer"
            onClick={handleOpenPost}
          >
            <div 
              className="rounded-none overflow-hidden relative"
              aria-label={post.media.alt}
              role="img"
              style={{ background: `linear-gradient(135deg, ${post.media.colorFrom || '#FEDAF7'}, ${post.media.colorTo || '#E08ED1'})` }}
            >
              <img 
                src={post.media.url} 
                alt={post.media.alt || ""} 
                className="w-full object-cover transition-transform duration-500 group-hover/media:scale-105" 
                style={{ height: imageHeights[0] ? `${imageHeights[0]}px` : '192px' }}
                loading="lazy"
                onLoad={(e) => handleImageLoad(e, 0)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      ) : null}
      
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

      <PublicProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={post.user.id || ''}
      />
    </article>
  );
};

export default PostCard;

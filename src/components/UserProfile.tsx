import React, { useState, useMemo } from 'react';
import { MoreHorizontal, MessageCircle, Heart, Share, Bookmark, Plus, Check, MapPin, Link as LinkIcon, Calendar, Users, Video as VideoIcon, ChevronDown, ChevronUp, Image, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { ProfileHeaderSkeleton, PostCardSkeleton, VideoCardSkeleton, TabContentSkeleton } from '@/components/ui/loading-states';
import { MOCK_VIDEOS, type Video } from '@/data/mock';
import EditProfileModal from '@/components/EditProfileModal';
import { useUserPosts } from '@/hooks/useUserPosts';
import { usePostMutations } from '@/hooks/usePostMutations';

interface UserProfileProps {
  className?: string;
  showHeader?: boolean;
  onMessageClick?: () => void;
  onSettingsClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  className = "", 
  showHeader = true,
  onMessageClick,
  onSettingsClick
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, isLoading } = useUser();
  const { posts: userPosts, isLoading: postsLoading } = useUserPosts(user?.id);
  const { toggleLike } = usePostMutations();

  const userVideos = useMemo(() => {
    if (!user) return [];
    return MOCK_VIDEOS.slice(0, user.stats.videos || 2).map(video => ({
      ...video,
      user: { ...video.user, name: user.name, initials: user.initials }
    }));
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className={`w-full ${className}`}>
        <ProfileHeaderSkeleton />
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
          <TabContentSkeleton />
        </div>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return "now";
  };

  const PostCard = ({ post }: { post: any }) => {
    const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);

    const handleLike = async () => {
      if (!user) return;
      
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      await toggleLike(post.id, user.id, isLiked);
    };

    return (
    <Card className="mb-4 overflow-hidden rounded-none border-x-0 border-t-0 border-b border-border/50 bg-card transition-all duration-200">
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage src="https://picsum.photos/100/100?random=profile" alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-foreground truncate">{user.name}</span>
              {user.isVerified && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                  <Check className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatTime(post.created_at)}
            </span>
          </div>
        </div>
        
        <p className="text-foreground leading-relaxed mb-4">{post.content}</p>
        
        {post.media_url && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="w-full h-64 object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors duration-150 min-h-[40px] p-2 -m-2 ${
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likesCount}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-150 min-h-[40px] p-2 -m-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments_count || 0}</span>
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-muted/50 transition-colors duration-150 min-h-[40px] min-w-[40px]">
            <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </CardContent>
    </Card>
    );
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <Card className="mb-4 overflow-hidden rounded-none border-x-0 border-t-0 border-b border-border/50 bg-card transition-all duration-200">
      <CardContent className="px-4 sm:px-6 py-6">
        <div className="relative mb-4 rounded-xl overflow-hidden">
          <img 
            src={`https://picsum.photos/400/300?random=${video.id + 100}`} 
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150 shadow-lg">
              <div className="w-0 h-0 border-l-[12px] border-l-foreground border-y-[8px] border-y-transparent ml-1"></div>
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">{video.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-150 min-h-[40px] p-2 -m-2">
              <Heart className="h-5 w-5" />
              <span className="font-medium">{video.stats.likes}</span>
            </button>
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-150 min-h-[40px] p-2 -m-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{video.stats.comments}</span>
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-muted/50 transition-colors duration-150 min-h-[40px] min-w-[40px]">
            <Bookmark className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, title, description, ctaText, onCtaClick }: {
    icon: React.ElementType;
    title: string;
    description: string;
    ctaText?: string;
    onCtaClick?: () => void;
  }) => (
    <Card className="p-12 text-center rounded-2xl border border-border/50 bg-muted/20">
      <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {ctaText && onCtaClick && (
        <Button onClick={onCtaClick} className="min-h-[40px]">
          {ctaText}
        </Button>
      )}
    </Card>
  );

  const bio = user.bio || user.subtitle || "Living life to the fullest and sharing my journey with amazing people. Always excited to connect and learn from this incredible community!";
  const shouldTruncateBio = bio.length > 150;
  const displayBio = shouldTruncateBio && !showFullBio ? bio.slice(0, 150) + "..." : bio;

  // Links Modal Component
  const LinksModal = () => {
    if (!user.website) return null;
    
    const links = Array.isArray(user.website) ? user.website : [user.website];
    
    return (
      <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Links
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {links.filter(link => link).map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">
                    {link.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                  className="ml-2 flex-shrink-0"
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Cover Image */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
          style={{
            backgroundImage: `url('${user.coverImage || 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?auto=format&fit=crop&w=1200&q=80'}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        
        {/* Header controls */}
        {showHeader && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button 
              variant="outline"
              size="icon"
              onClick={onMessageClick}
              className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 min-h-[40px] min-w-[40px]"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              onClick={onSettingsClick}
              className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 min-h-[40px] min-w-[40px]"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="relative bg-background pb-8">
        {/* Avatar */}
        <div className="absolute -top-16 left-4 sm:left-6">
          <Avatar className="h-32 w-32 ring-4 ring-background shadow-xl">
            <AvatarImage 
              src={user.avatar || "https://picsum.photos/200/200?random=profile"} 
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Online Status */}
          {user.isOnline && (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-3 border-background rounded-full">
            </div>
          )}
        </div>

        <div className="pt-20 px-4 sm:px-6">
          {/* Name and Username */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.name}
              </h1>
              {user.isVerified && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                  <Check className="h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditProfile(true)}
                className="h-8 w-8 hover:bg-muted/50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-3">
              <span className="font-bold text-foreground">{user.stats.followers.toLocaleString()}</span> followers • <span className="font-bold text-foreground">{user.stats.following.toLocaleString()}</span> following
            </p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <p className="text-foreground leading-relaxed mb-2">
              {displayBio}
            </p>
            {shouldTruncateBio && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors duration-150 min-h-[40px] p-2 -m-2"
              >
                {showFullBio ? (
                  <>
                    Show less <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Location, Join Date, and Links */}
          <div className="space-y-3 mb-6 text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {user.joinedDate}</span>
              </div>
            </div>
            
            {/* Links section on new line */}
            {user.website && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                {(() => {
                  // Handle multiple links case - support both string and array
                  const links = Array.isArray(user.website) ? user.website : [user.website];
                  const firstLink = links[0];
                  
                  if (!firstLink) return null;
                  
                  const displayLink = firstLink.replace(/^https?:\/\//, '');
                  
                  if (links.length === 1) {
                    return (
                      <a 
                        href={firstLink} 
                        className="font-bold hover:text-primary transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {displayLink}
                      </a>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => setShowLinksModal(true)}
                        className="font-bold hover:text-primary transition-colors text-left"
                      >
                        {displayLink}... and {links.length - 1} more
                      </button>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          {/* Message and Follow buttons */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={() => setIsFollowing(!isFollowing)}
              variant={isFollowing ? "outline" : "default"}
              className="flex-1 h-12 font-medium transition-all duration-200"
            >
              {isFollowing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={onMessageClick}
              className="flex-1 h-12 font-medium"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>

        {/* Clear Tabs: Posts | Videos | Saved */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 sm:px-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl mb-6 h-12">
              <TabsTrigger 
                value="posts" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all font-medium min-h-[40px]"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="videos" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all font-medium min-h-[40px]"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all font-medium min-h-[40px]"
              >
                Saved
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="px-4 sm:px-6">
                <EmptyState
                  icon={MessageCircle}
                  title="No posts yet"
                  description="Share your thoughts and experiences with the community"
                  ctaText="Create first post"
                  onCtaClick={() => {}}
                />
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {userVideos.length > 0 ? (
              userVideos.map((video) => <VideoCard key={video.id} video={video} />)
            ) : (
              <div className="px-4 sm:px-6">
                <EmptyState
                  icon={VideoIcon}
                  title="No videos yet"
                  description="Create engaging video content to connect with your audience"
                  ctaText="Upload first video"
                  onCtaClick={() => {}}
                />
              </div>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            <div className="px-4 sm:px-6">
              <EmptyState
                icon={Bookmark}
                title="No saved content"
                description="Save posts and videos to view them later"
                ctaText="Explore content"
                onCtaClick={() => {}}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    
    {/* Links Modal */}
    <LinksModal />
    
    {/* Edit Profile Modal */}
    <EditProfileModal 
      isOpen={showEditProfile} 
      onClose={() => setShowEditProfile(false)} 
    />
  </div>
  );
};

export default UserProfile;
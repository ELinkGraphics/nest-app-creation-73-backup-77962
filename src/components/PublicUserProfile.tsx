import React, { useState } from 'react';
import { MapPin, Calendar, Link as LinkIcon, Check, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

interface PublicUserProfileProps {
  userId: string;
  className?: string;
  showHeader?: boolean;
  onMessageClick?: () => void;
}

const PublicUserProfile: React.FC<PublicUserProfileProps> = ({ 
  userId,
  className = '',
  showHeader = true,
  onMessageClick
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllBio, setShowAllBio] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);

  // TODO: Replace with actual data fetching based on userId
  const isLoading = false;
  const user = {
    id: userId,
    name: 'User Name',
    username: '@username',
    initials: 'UN',
    avatar: '',
    avatarColor: '#4B164C',
    coverImage: '',
    bio: 'This is a user bio...',
    subtitle: 'Subtitle',
    location: 'Location',
    website: ['https://example.com'],
    joinedDate: new Date().toISOString(),
    isVerified: false,
    stats: {
      followers: 0,
      following: 0,
      posts: 0,
      videos: 0
    }
  };

  const posts: any[] = [];
  const videos: any[] = [];

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const PostCard = ({ post }: { post: any }) => (
    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user?.avatar_url} />
          <AvatarFallback style={{ backgroundColor: post.user?.avatar_color }}>
            {post.user?.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.user?.name}</span>
            <span className="text-muted-foreground text-sm">{post.user?.username}</span>
            <span className="text-muted-foreground text-sm">· {formatTime(post.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words">{post.content}</p>
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img src={post.media_url} alt={post.media_alt || ''} className="w-full" />
            </div>
          )}
          <div className="flex items-center gap-6 mt-3 text-muted-foreground text-sm">
            <span>{post.likes_count || 0} likes</span>
            <span>{post.comments_count || 0} comments</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const VideoCard = ({ video }: { video: any }) => (
    <Card className="overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="aspect-[9/16] bg-muted relative">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground">No thumbnail</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>{video.likes_count || 0} likes</span>
          <span>{video.views_count || 0} views</span>
        </div>
      </div>
    </Card>
  );

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-center">{message}</p>
    </div>
  );

  const LinksModal = () => {
    const websites = Array.isArray(user.website) ? user.website : user.website ? [user.website] : [];
    
    return (
      <Dialog open={showLinksModal} onOpenChange={setShowLinksModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {websites.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="flex-1 truncate">{link}</span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const bioLimit = 150;
  const shouldTruncateBio = user.bio && user.bio.length > bioLimit;
  const displayBio = shouldTruncateBio && !showAllBio 
    ? user.bio.slice(0, bioLimit) + '...' 
    : user.bio;

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="space-y-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const websites = Array.isArray(user.website) ? user.website : user.website ? [user.website] : [];

  return (
    <div className={`w-full ${className}`}>
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        {user.coverImage && (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback 
              className="text-3xl font-bold text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.isVerified && (
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={isFollowing ? "outline" : "default"}
            className="flex-1"
            onClick={() => setIsFollowing(!isFollowing)}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onMessageClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div>
            <div className="font-bold">{user.stats.followers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="font-bold">{user.stats.following}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-4">
            <p className="whitespace-pre-wrap break-words">
              {displayBio}
              {shouldTruncateBio && (
                <button
                  onClick={() => setShowAllBio(!showAllBio)}
                  className="text-primary ml-1 hover:underline"
                >
                  {showAllBio ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Location */}
        {user.location && (
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{user.location}</span>
          </div>
        )}

        {/* Website */}
        {websites.length > 0 && (
          <div className="flex items-center gap-2 text-primary mb-2">
            <LinkIcon className="h-4 w-4" />
            {websites.length === 1 ? (
              <a 
                href={websites[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline truncate"
              >
                {websites[0]}
              </a>
            ) : (
              <button 
                onClick={() => setShowLinksModal(true)}
                className="hover:underline"
              >
                {websites.length} links
              </button>
            )}
          </div>
        )}

        {/* Join Date */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="space-y-4 p-4">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.post_id} post={post} />)
            ) : (
              <EmptyState 
                icon={MessageCircle}
                message="No posts yet"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-0">
          <div className="grid grid-cols-3 gap-1 p-1">
            {videos.length > 0 ? (
              videos.map((video) => <VideoCard key={video.video_id} video={video} />)
            ) : (
              <div className="col-span-3">
                <EmptyState 
                  icon={MessageCircle}
                  message="No videos yet"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <LinksModal />
    </div>
  );
};

export default PublicUserProfile;

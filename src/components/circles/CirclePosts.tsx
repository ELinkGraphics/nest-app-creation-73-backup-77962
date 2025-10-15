import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MessageCircle, Share, Share2, MoreHorizontal, Crown, Bookmark, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TipButton } from './TipButton';

interface CirclePostsProps {
  circle: any;
  isOwner: boolean;
}

const CirclePosts: React.FC<CirclePostsProps> = ({ circle, isOwner }) => {
  const navigate = useNavigate();
  const { id: circleId } = useParams();

  const handleReadMore = (post: any) => {
    navigate(`/circle/${circleId}/post/${post.id}`);
  };

  const mockPosts = [
    {
      id: '1',
      author: {
        name: circle?.creator?.name || 'Circle Owner',
        avatar: circle?.creator?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        isOwner: true
      },
      title: 'New Product Feature Launch',
      content: 'Excited to announce our latest innovation! We\'re looking for beta testers from our amazing community to help us perfect this feature.',
      timestamp: '2h',
      likes: 128,
      comments: 34,
      shares: 12,
      tips: 8,
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
      isPremium: true
    },
    {
      id: '2',
      author: {
        name: 'Alex Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isOwner: false
      },
      title: 'Networking Event Success',
      content: 'What an incredible evening! Thank you to everyone who joined our networking event. The connections made were truly inspiring.',
      timestamp: '5h',
      likes: 89,
      comments: 23,
      shares: 8,
      tips: 12,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
      isPremium: false
    },
    {
      id: '3',
      author: {
        name: 'Maria Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        isOwner: false
      },
      title: 'Community Workshop Recap',
      content: 'Just wrapped up an amazing workshop on digital transformation. The insights shared by our community members were incredible!',
      timestamp: '1d',
      likes: 67,
      comments: 15,
      shares: 6,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      isPremium: false
    },
    {
      id: '4',
      author: {
        name: circle?.creator?.name || 'Circle Owner',
        avatar: circle?.creator?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        isOwner: true
      },
      title: 'Exclusive Member Benefits',
      content: 'Thrilled to introduce our new premium membership benefits! Access to exclusive content, priority support, and early feature previews.',
      timestamp: '2d',
      likes: 156,
      comments: 45,
      shares: 18,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      isPremium: true
    }
  ];

  return (
    <div className="space-y-0 scroll-smooth">
      {/* Create Post - Only for Owners */}
      {isOwner && (
        <div className="px-4 py-6 bg-muted/30 border-b border-border animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
              ME
            </div>
            <div className="flex-1 bg-background/80 rounded-full px-4 py-3 cursor-pointer border border-border hover:bg-background transition-smooth hover-scale">
              <p className="text-sm text-muted-foreground">Share something with the circle...</p>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="px-6 py-4 bg-background/50 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Posts</h2>
          <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
        </div>
      </div>

      {/* Posts Grid Container */}
      <div className="bg-muted/20 min-h-screen">
        {/* Posts Grid - Enhanced Spacing */}
        <div className="px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {mockPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="relative w-full max-w-[420px] h-[550px] overflow-hidden bg-neutral-900 text-white mx-auto animate-fade-in hover-scale shadow-elegant rounded-lg"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Full-bleed background image */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />

                {/* Top-right bookmark chip */}
                <div className="absolute top-4 right-4 z-30">
                  <div className="rounded-full bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-smooth cursor-pointer hover-scale">
                    <Bookmark className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Bottom solid grey blurred overlay that feathers above */}
                <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gray-900/80 backdrop-blur-md" />
                <div className="absolute inset-x-0 bottom-[180px] h-[60px] bg-gradient-to-t from-gray-900/80 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-6">
                  {/* Title + optional Premium pill */}
                  <div className="mb-3 flex items-start gap-3">
                    <h3 className="text-xl font-bold text-white leading-tight flex-1">
                      {post.title}
                    </h3>
                    {post.isPremium && (
                      <span className="rounded-full bg-gradient-secondary px-3 py-1 text-xs font-semibold text-primary-foreground animate-scale-in shadow-glow">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Row with social buttons including tip button */}
                  <div className="flex gap-2 mb-4">
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition-smooth hover-scale">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white hover:bg-white/25 transition-smooth hover-scale">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </button>
                    <div className="flex-1 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-smooth">
                      <TipButton
                        postId={post.id}
                        authorName={post.author.name}
                        tipCount={post.tips || 0}
                        userHasTipped={false}
                        variant="card"
                        onTip={(amount) => console.log(`Tipped $${amount} to ${post.author.name}`)}
                      />
                    </div>
                  </div>

                  {/* Full-width Read more button styled like rounded gradient CTA */}
                  <button 
                    onClick={() => handleReadMore(post)}
                    className="w-full rounded-full py-3 px-6 text-base font-semibold bg-white text-gray-900 shadow-glow hover:shadow-xl hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    Read more
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Spacer for better scroll experience */}
        <div className="h-24 flex items-center justify-center">
          <div className="w-16 h-1 bg-muted rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default CirclePosts;
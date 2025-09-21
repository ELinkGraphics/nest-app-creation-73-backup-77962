import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { MOCK_POSTS, Post } from '@/data/mock';

const PostSkeleton = () => (
  <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 animate-pulse shadow-elegant">
    <div className="flex items-center gap-4">
      <div className="size-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="flex-1">
        <div className="h-4 w-32 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 mb-2" />
        <div className="h-3 w-20 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
      </div>
    </div>
    <div className="mt-6 h-48 w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="mt-6 space-y-3">
      <div className="h-4 w-full rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="h-4 w-3/4 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
    </div>
    <div className="mt-4 flex gap-2">
      <div className="h-6 w-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300" />
      <div className="h-6 w-20 rounded-full bg-gradient-to-r from-gray-200 to-gray-300" />
    </div>
  </div>
);

interface FeedViewProps {
  onRefresh?: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section aria-labelledby="feed-heading" className="pt-2">
        <h2 id="feed-heading" className="sr-only">
          Feed
        </h2>
        
        {loading ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length ? (
          <div className="space-y-0">
            {posts.map((post, index) => (
              <div 
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard 
                  post={post} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center bg-gradient-subtle animate-fade-in">
            <div className="size-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-base font-medium text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Be the first to share something amazing!</p>
          </div>
        )}
      </section>
    </>
  );
};
import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { Post } from '@/data/mock';
import { supabase } from '@/integrations/supabase/client';

const PostSkeleton = () => (
  <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-3 w-32 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
      </div>
    </div>
    <div className="mt-4 h-40 w-full rounded-xl bg-gray-100" />
    <div className="mt-4 h-3 w-3/4 rounded bg-gray-200" />
    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
  </div>
);

const Feed: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_feed_posts', {
        page_num: 0,
        page_size: 10
      });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map((item: any) => ({
          id: item.post_id,
          user: {
            name: item.circle_id ? item.circle_name : item.name,
            initials: item.circle_id ? (item.circle_name?.substring(0, 2).toUpperCase() || 'CI') : item.initials,
            avatarColor: item.avatar_color,
            verified: item.is_verified,
            avatar: item.circle_id ? item.circle_avatar_url : item.avatar_url,
          },
          time: new Date(item.created_at).toISOString(),
          content: item.content,
          media: item.media_url ? {
            kind: "image" as const,
            alt: item.media_alt || '',
            colorFrom: item.media_color_from || '#4B164C',
            colorTo: item.media_color_to || '#22194D',
            url: item.media_url,
          } : item.media_urls && item.media_urls.length > 0 ? {
            kind: "image" as const,
            alt: item.media_alt || '',
            colorFrom: item.media_color_from || '#4B164C',
            colorTo: item.media_color_to || '#22194D',
            urls: item.media_urls,
          } : undefined,
          tags: item.tags || [],
          stats: { 
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            shares: item.shares_count || 0,
          },
          sponsored: item.is_sponsored || false,
          userHasLiked: item.user_has_liked || false,
          circleId: item.circle_id || undefined,
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="feed-heading" className="pt-2">
      <h2 id="feed-heading" className="sr-only">
        Feed
      </h2>
      
      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-center">
          <p className="text-sm text-gray-600">No posts yet.</p>
        </div>
      )}
    </section>
  );
};

export default Feed;
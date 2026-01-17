"use client";

import React, { useState, useEffect } from 'react';
import { discoverApi } from '@/lib/discoverApi';
import { Post } from '@/types/discover';
import PostCard from './PostCard';
import { Sparkles } from 'lucide-react';

interface RecommendedPostsProps {
  limit?: number;
}

export default function RecommendedPosts({ limit = 10 }: RecommendedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedPosts();
  }, [limit]);

  const fetchRecommendedPosts = async () => {
    try {
      setLoading(true);
      const data = await discoverApi.getRecommendedPosts(limit);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch recommended posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = () => {
    fetchRecommendedPosts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800">
          <Sparkles className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 font-bold mb-1">No recommendations yet</p>
          <p className="text-neutral-600 text-sm">
            Explore communities and interact with posts to get personalized recommendations
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdate={handlePostUpdate}
              showCommunity={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

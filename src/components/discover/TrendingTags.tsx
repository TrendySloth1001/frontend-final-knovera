"use client";

import React, { useState, useEffect } from 'react';
import { discoverApi, TrendingTag } from '@/lib/discoverApi';
import { Hash, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react';

export default function TrendingTags() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await discoverApi.getTrendingTags(20);
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch trending tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'bg-green-500/10 text-green-500 border-green-500/20',
      'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'bg-pink-500/10 text-pink-500 border-pink-500/20'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-black border border-neutral-800 rounded-2xl p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-neutral-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-white">Trending Topics</h2>
        </div>
        <span className="text-xs text-neutral-500 font-medium">Last 7 days</span>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No trending tags found
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <button
              key={tag.tag}
              className={`px-4 py-2 rounded-full border transition-all hover:scale-105 ${getTagColor(index)}`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="font-bold text-sm">{tag.tag}</span>
                <span className="text-xs opacity-70">
                  {tag.postCount}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Top Tags Detail View */}
      {tags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-400 mb-4">Top 5 Details</h3>
          <div className="space-y-3">
            {tags.slice(0, 5).map((tag, index) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 font-bold text-sm">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-neutral-400" />
                    <span className="font-bold text-white">{tag.tag}</span>
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{tag.postCount} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{tag.totalVotes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{tag.totalComments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

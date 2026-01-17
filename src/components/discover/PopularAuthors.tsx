"use client";

import React, { useState, useEffect } from 'react';
import { discoverApi, PopularAuthor } from '@/lib/discoverApi';
import { Users, TrendingUp, MessageSquare, UserPlus } from 'lucide-react';

export default function PopularAuthors() {
  const [authors, setAuthors] = useState<PopularAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const data = await discoverApi.getPopularAuthors(10);
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch popular authors:', error);
    } finally {
      setLoading(false);
    }
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
          <Users className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Popular Authors</h2>
        </div>
        <span className="text-xs text-neutral-500 font-medium">Last 30 days</span>
      </div>

      {/* Authors List */}
      {authors.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No authors found
        </div>
      ) : (
        <div className="space-y-3">
          {authors.map((author) => (
            <div
              key={author.user.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-neutral-900/50 hover:bg-neutral-900 transition-all group"
            >
              {/* Rank Badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-400">
                  #{author.rank}
                </span>
              </div>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                {author.user.avatarUrl ? (
                  <img
                    src={author.user.avatarUrl}
                    alt={author.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {author.user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white mb-1 truncate">
                  {author.user.displayName}
                </div>
                {author.user.bio && (
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                    {author.user.bio}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1 text-neutral-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{author.stats.posts} posts</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-500">
                    <MessageSquare className="w-3 h-3" />
                    <span>{author.stats.votes} votes</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-500">
                    <UserPlus className="w-3 h-3" />
                    <span>{author.stats.followers} followers</span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button className="flex-shrink-0 px-4 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-neutral-200 transition-all opacity-0 group-hover:opacity-100">
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

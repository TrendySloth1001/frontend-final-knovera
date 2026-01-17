/**
 * Community Page
 * View community details, posts, and members
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCommunity, usePosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import { getAuthToken } from '@/lib/api';

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.id as string;
  
  const { community, loading: communityLoading, joinCommunity, leaveCommunity } = useCommunity(communityId);
  const { posts, loading: postsLoading, refresh } = usePosts({ communityId });
  const [isJoining, setIsJoining] = useState(false);
  const isAuthenticated = !!getAuthToken();

  const handleJoinToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to join communities');
      return;
    }
    
    try {
      setIsJoining(true);
      if (community?.isMember) {
        await leaveCommunity();
      } else {
        await joinCommunity();
      }
    } catch (error) {
      console.error('Failed to toggle membership:', error);
    } finally {
      setIsJoining(false);
    }
  };

  if (communityLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Community not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Banner */}
      {community.bannerUrl && (
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Community Header */}
      <div className="bg-white shadow-md p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {community.avatarUrl && (
            <img
              src={community.avatarUrl}
              alt={community.name}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
            />
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{community.name}</h1>
            {community.description && (
              <p className="text-gray-600 mb-3">{community.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{community.memberCount.toLocaleString()} members</span>
              <span>{community.postCount.toLocaleString()} posts</span>
              {community.userRole && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {community.userRole}
                </span>
              )}
            </div>
          </div>

          {/* Join/Leave Button */}
          <button
            onClick={handleJoinToggle}
            disabled={isJoining}
            className={`px-6 py-2 rounded-lg font-medium ${
              community.isMember
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isJoining ? 'Loading...' : community.isMember ? 'Leave' : 'Join'}
          </button>
        </div>

        {/* Community Rules */}
        {community.rules && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Community Rules</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{community.rules}</p>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        
        {postsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdate={refresh} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">No posts yet</p>
            {community.isMember && <p>Be the first to post in this community!</p>}
          </div>
        )}
      </div>
    </div>
  );
}

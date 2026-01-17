/**
 * Post Card Component
 * Display a single post preview - Dark Mode
 */

'use client';

import { useState } from 'react';
import { Post, VoteType, PostMedia, MediaType } from '@/types/discover';
import { discoverApi } from '@/lib/discoverApi';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { getAuthToken } from '@/lib/api';
import VideoPlayer from './VideoPlayer';
import ShareToChatDrawer from './ShareToChatDrawer';

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
  showCommunity?: boolean;
  detailed?: boolean;
}

export default function PostCard({ post, onPostUpdate, showCommunity = false, detailed = false }: PostCardProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const isAuthenticated = !!getAuthToken();

  const handleVote = async (type: VoteType) => {
    if (!isAuthenticated) return; // Or show login prompt
    if (isVoting) return;

    try {
      setIsVoting(true);
      // Optimistic update
      const backendVoteType = type === VoteType.UPVOTE ? 'UP' : 'DOWN';
      const isRemoving = currentPost.userVote === backendVoteType;

      const oldVoteValue = currentPost.userVote === 'UP' ? 1 : (currentPost.userVote === 'DOWN' ? -1 : 0);
      let newVoteValue = 0;

      if (!isRemoving) {
        newVoteValue = backendVoteType === 'UP' ? 1 : -1;
      }

      const diff = newVoteValue - oldVoteValue;

      setCurrentPost(prev => ({
        ...prev,
        userVote: isRemoving ? null : backendVoteType,
        voteCount: prev.voteCount + diff
      }));

      await discoverApi.votePost(post.id, type);
      onPostUpdate?.();
    } catch (error) {
      console.error('Failed to vote:', error);
      setCurrentPost(post); // Revert
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    try {
      setIsSaving(true);
      if (currentPost.isSaved) {
        await discoverApi.unsavePost(post.id);
        setCurrentPost(prev => ({ ...prev, isSaved: false }));
      } else {
        await discoverApi.savePost(post.id);
        setCurrentPost(prev => ({ ...prev, isSaved: true }));
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMedia = (media: PostMedia[]) => {
    if (!media || media.length === 0) return null;

    if (media.length === 1) {
      const item = media[0];
      if (item.type === MediaType.IMAGE) {
        return (
          <div className="bg-black rounded-xl overflow-hidden mb-4 border border-neutral-800">
            <img src={item.url} alt="Post content" className="w-full max-h-[500px] object-contain mx-auto" />
          </div>
        );
      }
      if (item.type === MediaType.VIDEO) {
        return (
          <div className="bg-black rounded-xl overflow-hidden mb-4 border border-neutral-800 aspect-video group/video">
            <VideoPlayer src={item.url} className="w-full h-full" />
          </div>
        );
      }
    }

    return (
      <div className="bg-black rounded-xl aspect-video flex items-center justify-center mb-4 overflow-hidden border border-neutral-800">
        <div className="text-center">
          <ImageIcon size={48} className="mx-auto mb-2 text-neutral-700" />
          <p className="text-xs text-neutral-500 font-medium">Multiple Media Items ({media.length})</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-black border border-neutral-800 rounded-2xl overflow-hidden mb-6 shadow-sm group relative ${!detailed ? 'hover:border-neutral-700 hover:shadow-md hover:shadow-neutral-900/20 transition-all duration-300' : ''}`}>
      {/* Subtle Gradient Glow on Hover */}
      {!detailed && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}

      <div className="p-5 flex gap-4 relative z-10">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-2 text-neutral-500 pt-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleVote(VoteType.UPVOTE)}
            disabled={isVoting}
            className={`p-2 rounded-xl transition-all duration-200 ${currentPost.userVote === 'UP' ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20' : 'hover:bg-neutral-900 hover:text-white text-neutral-500'}`}
          >
            <ThumbsUp size={20} fill={currentPost.userVote === 'UP' ? "currentColor" : "none"} />
          </button>
          <span className={`text-sm font-black ${currentPost.userVote === 'UP' ? 'text-orange-500' : currentPost.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-300'}`}>
            {currentPost.voteCount}
          </span>
          <button
            onClick={() => handleVote(VoteType.DOWNVOTE)}
            disabled={isVoting}
            className={`p-2 rounded-lg transition-colors ${currentPost.userVote === 'DOWN' ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-neutral-900 text-neutral-400'}`}
          >
            <ThumbsDown size={20} fill={currentPost.userVote === 'DOWN' ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 font-medium">
            {(showCommunity && currentPost.community) && (
              <>
                <span className="text-white font-bold bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                  c/{currentPost.community.name}
                </span>
                <span className="text-neutral-600">•</span>
              </>
            )}
            <span className="hover:text-white transition-colors cursor-pointer">u/{currentPost.author?.displayName}</span>
            <span className="text-neutral-600">•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Title & Body */}
          <h3 className={`text-xl font-bold text-white mb-3 leading-snug ${!detailed && 'line-clamp-2'}`}>
            {currentPost.title}
          </h3>
          {currentPost.description && (
            <p className={`text-neutral-300 text-sm mb-4 leading-relaxed ${!detailed && 'line-clamp-3'}`}>
              {currentPost.description}
            </p>
          )}

          {/* Media */}
          {renderMedia(currentPost.media)}

          {/* Actions */}
          <div className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-wide flex-wrap pt-2">
            <button className="flex items-center gap-2 hover:bg-neutral-900 hover:text-white px-4 py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800">
              <MessageSquare size={16} /> {currentPost.commentCount} Comments
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={isSaving}
              className={`flex items-center gap-2 hover:bg-neutral-900 hover:text-white px-4 py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800 ${currentPost.isSaved ? 'text-white' : ''}`}
            >
              <Bookmark size={16} fill={currentPost.isSaved ? "currentColor" : "none"} /> {currentPost.isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareDrawer(true);
              }}
              className="flex items-center gap-2 hover:bg-neutral-900 hover:text-white px-4 py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800"
            >
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 hover:bg-red-500/10 hover:text-red-500 px-4 py-2 rounded-full transition-colors ml-auto">
              <Flag size={16} /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Share Drawer */}
      <ShareToChatDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        sharedPostId={post.id}
        previewTitle={post.title}
        previewImage={post.media?.[0]?.thumbnailUrl || post.media?.[0]?.url}
      />
    </div>
  );
}

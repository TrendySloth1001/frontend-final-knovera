/**
 * Post Card Component
 * Display a single post preview - Dark Mode
 */

'use client';

import { useState } from 'react';
import { Post, VoteType, PostMedia, MediaType } from '@/types/discover';
import { discoverApi } from '@/lib/discoverApi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  Clock,
  Image as ImageIcon,
  Repeat,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { getAuthToken } from '@/lib/api';
import VideoPlayer from './VideoPlayer';
import ShareToChatDrawer from './ShareToChatDrawer';
import CrosspostDrawer from './CrosspostDrawer';

interface PostCardProps {
  post: Post;
  onPostUpdate?: () => void;
  showCommunity?: boolean;
  detailed?: boolean;
}

export default function PostCard({ post, onPostUpdate, showCommunity = false, detailed = false }: PostCardProps) {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [isVoting, setIsVoting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [showCrosspostDrawer, setShowCrosspostDrawer] = useState(false);
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
    <div className={`bg-black border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-6 shadow-sm group relative ${!detailed ? 'hover:border-neutral-700 hover:shadow-md hover:shadow-neutral-900/20 transition-all duration-300' : ''} ${currentPost.isRead ? 'opacity-75' : ''}`}>
      {/* Subtle Gradient Glow on Hover */}
      {!detailed && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}

      <div className="p-3 sm:p-5 flex gap-2 sm:gap-4 relative z-10">
        {/* Vote Column - Responsive */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 text-neutral-500 pt-0.5 sm:pt-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleVote(VoteType.UPVOTE)}
            disabled={isVoting}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 ${currentPost.userVote === 'UP' ? 'bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20' : 'hover:bg-neutral-900 hover:text-white text-neutral-500'}`}
          >
            <ThumbsUp size={18} className="sm:w-5 sm:h-5" fill={currentPost.userVote === 'UP' ? "currentColor" : "none"} />
          </button>
          <span className={`text-xs sm:text-sm font-black ${currentPost.userVote === 'UP' ? 'text-orange-500' : currentPost.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-300'}`}>
            {currentPost.voteCount}
          </span>
          <button
            onClick={() => handleVote(VoteType.DOWNVOTE)}
            disabled={isVoting}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${currentPost.userVote === 'DOWN' ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-neutral-900 text-neutral-400'}`}
          >
            <ThumbsDown size={18} className="sm:w-5 sm:h-5" fill={currentPost.userVote === 'DOWN' ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header - Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-neutral-400 mb-2 sm:mb-3 font-medium flex-wrap">
            {/* Show communities if crossposted */}
            {(showCommunity && currentPost.communities && currentPost.communities.length > 0) && (
              <>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {currentPost.communities.map((community, index) => (
                    <div key={community.id} className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-white text-xs font-bold bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border sm:rounded-md border-neutral-800 flex items-center gap-1">
                        {community.avatarUrl && (
                          <img src={community.avatarUrl} alt={community.name} className="w-3 h-3 sm:w-4 sm:h-4 rounded object-cover" />
                        )}
                        <span className="hidden sm:inline">c/</span>{community.name}
                      </span>
                      {index < (currentPost.communities?.length || 0) - 1 && (
                        <span className="text-neutral-600 hidden sm:inline">+</span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-neutral-600 hidden sm:inline">•</span>
              </>
            )}
            {/* Fallback to legacy community */}
            {(showCommunity && !currentPost.communities && currentPost.community) && (
              <>
                <span className="text-white text-xs font-bold bg-neutral-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-md border border-neutral-800">
                  <span className="hidden sm:inline">c/</span>{currentPost.community.name}
                </span>
                <span className="text-neutral-600 hidden sm:inline">•</span>
              </>
            )}
            <div className="flex items-center gap-1 sm:gap-1.5 hover:text-white transition-colors cursor-pointer group/author">
              {currentPost.author?.avatarUrl ? (
                <img src={currentPost.author.avatarUrl} alt={currentPost.author.displayName} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover" />
              ) : (
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[8px] font-bold text-neutral-500">
                  {currentPost.author?.displayName?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs"><span className="hidden sm:inline">u/</span>{currentPost.author?.displayName}</span>
            </div>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-0.5 sm:gap-1 text-xs">
              <Clock size={11} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">
                {(() => {
                  try {
                    return currentPost.createdAt ? formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true }) : '';
                  } catch (e) {
                    return '';
                  }
                })()}
              </span>
              <span className="sm:hidden">
                {(() => {
                  try {
                    return currentPost.createdAt ? formatDistanceToNow(new Date(currentPost.createdAt)) : '';
                  } catch (e) {
                    return '';
                  }
                })()}
              </span>
            </span>
          </div>

          {/* Title & Body - Responsive */}
          <h3 className={`text-base sm:text-xl font-bold text-white mb-2 sm:mb-3 leading-snug ${!detailed && 'line-clamp-2'}`}>
            {currentPost.title}
          </h3>
          {currentPost.description && (
            <p className={`text-neutral-300 text-sm mb-3 sm:mb-4 leading-relaxed ${!detailed && 'line-clamp-3'}`}>
              {currentPost.description}
            </p>
          )}

          {/* Media */}
          {renderMedia(currentPost.media)}

          {/* Actions - Responsive */}
          <div className="flex items-center gap-1 sm:gap-2 text-neutral-400 font-bold text-xs uppercase tracking-wide flex-wrap pt-2">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-transparent text-neutral-500 text-xs" title="Views">
              <Eye size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{currentPost.viewCount || 0}</span>
            </div>

            <button className="flex items-center gap-1 sm:gap-2 hover:bg-neutral-900 hover:text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800 text-xs">
              <MessageSquare size={14} className="sm:w-4 sm:h-4" /> {currentPost.commentCount}<span className="hidden sm:inline"> Comments</span>
            </button>

            {/* Crosspost for Owner */}
            {user?.user?.id === currentPost.authorId && (
              <button
                className="hidden sm:flex items-center gap-2 hover:bg-neutral-900 hover:text-white px-4 py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCrosspostDrawer(true);
                }}
              >
                <Repeat size={16} /> Crosspost
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); handleSave(); }}
              disabled={isSaving}
              className={`flex items-center gap-1 sm:gap-2 hover:bg-neutral-900 hover:text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800 text-xs ${currentPost.isSaved ? 'text-white' : ''}`}
            >
              <Bookmark size={14} className="sm:w-4 sm:h-4" fill={currentPost.isSaved ? "currentColor" : "none"} /> <span className="hidden sm:inline">{currentPost.isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareDrawer(true);
              }}
              className="flex items-center gap-1 sm:gap-2 hover:bg-neutral-900 hover:text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors border border-transparent hover:border-neutral-800 text-xs"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Share</span>
            </button>
            {detailed && (
              <button className="hidden sm:flex items-center gap-2 hover:bg-red-500/10 hover:text-red-500 px-4 py-2 rounded-full transition-colors ml-auto text-xs">
                <Flag size={16} /> Report
              </button>
            )}
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

      {/* Crosspost Drawer */}
      <CrosspostDrawer
        isOpen={showCrosspostDrawer}
        onClose={() => setShowCrosspostDrawer(false)}
        postId={post.id}
        postTitle={post.title}
        existingCommunityIds={currentPost.communities?.map(c => c.id) || []}
        onSuccess={async () => {
          // Refresh the post to show new communities
          try {
            const updatedPost = await discoverApi.getPostById(post.id);
            setCurrentPost(updatedPost);
          } catch (error) {
            console.error('Failed to refresh post:', error);
          }
          onPostUpdate?.();
        }}
      />
    </div>
  );
}

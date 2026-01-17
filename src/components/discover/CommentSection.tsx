/**
 * Comment Section Component
 * Display and manage comments with nested replies - Dark Mode
 */

'use client';

import { useState } from 'react';
import { Comment, VoteType, ReactionType } from '@/types/discover';
import { useComments, useVoting } from '@/hooks/useDiscover';
import VoteButtons from './VoteButtons';
import CommentReactions, { HeaderReactionPicker } from './CommentReactions';
import CommentSortDropdown, { CommentSortOption } from './CommentSortDropdown';
import { getAuthToken } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { discoverApi } from '@/lib/discoverApi';
import { MessageSquare, Trash2, CornerDownRight, ThumbsUp, ThumbsDown, MoreHorizontal, MessageCircle, Award } from 'lucide-react';

// Build nested comment tree from flat array
function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create a map of all comments with empty replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      }
    } else {
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}

interface CommentSectionProps {
  postId: string;
  postAuthorId?: string;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  postAuthorId?: string;
  onReply: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, voteType: VoteType) => void;
  onRemoveVote: (commentId: string) => void;
  onReact: (commentId: string, reactionType: ReactionType) => Promise<void>;
  onRemoveReaction: (commentId: string) => Promise<void>;
  onToggleHighlight: (commentId: string) => Promise<void>;
  depth?: number;
  isLast?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  postAuthorId,
  onReply,
  onDelete,
  onVote,
  onRemoveVote,
  onReact,
  onRemoveReaction,
  onToggleHighlight,
  depth = 0,
  isLast = false
}: CommentItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isAuthor = currentUserId && comment.authorId === currentUserId;
  const isPostAuthor = currentUserId && postAuthorId === currentUserId;

  const handleVote = async (voteType: VoteType) => {
    if (!getAuthToken()) return;
    const backendVoteType = voteType === VoteType.UPVOTE ? 'UP' : 'DOWN';
    if (comment.userVote === backendVoteType) {
      await onRemoveVote(comment.id);
    } else {
      await onVote(comment.id, voteType);
    }
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyBox(false);
  };

  return (
    <div className="relative">
      {/* The Thread Connector - Precise L-Shape */}
      {depth > 0 && (
        <div
          className="absolute"
          style={{
            left: '-28px',
            top: '-24px', // Connects from the bottom of the previous element's spine
            width: '28px',
            height: '44px',
            borderLeft: '2px solid #262626', // neutral-800
            borderBottom: '2px solid #262626',
            borderBottomLeftRadius: '20px',
            zIndex: 0
          }}
        />
      )}

      <div className="flex gap-3 py-2">
        {/* Avatar Section */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden border border-neutral-800 shadow-sm relative z-10">
            {comment.author?.avatarUrl ? (
              <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-500 font-bold text-xs">
                {comment.author?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Vertical line that continues down if there are more replies or siblings */}
          {((comment.replies && comment.replies.length > 0) || !isLast) && (
            <div className="flex-1 w-[2px] bg-neutral-800 mt-1" />
          )}
        </div>

        {/* Content Box */}
        <div className="flex-1 bg-black rounded-2xl p-4 shadow-sm border border-neutral-800 hover:border-neutral-700 transition-all duration-200 group">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm tracking-tight ${isAuthor ? 'text-blue-400' : 'text-white'}`}>
                {comment.author?.displayName}
              </span>
              {isAuthor && <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[10px] font-bold">OP</span>}
              {comment.isHighlighted && (
                <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Award size={10} />
                  Best Comment
                </span>
              )}
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>

              {/* Header Reaction Picker */}
              <div className="ml-1 border-l border-neutral-800 pl-3">
                <HeaderReactionPicker
                  commentId={comment.id}
                  userReaction={comment.userReaction}
                  onReact={onReact}
                  onRemoveReaction={onRemoveReaction}
                />
              </div>
            </div>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className={`text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-all ${showMoreMenu ? 'opacity-100 bg-neutral-800 text-white' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <MoreHorizontal size={14} />
              </button>

              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2">
                      Share
                    </button>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2">
                      Report
                    </button>
                    {isPostAuthor && !isAuthor && (
                      <button
                        onClick={() => {
                          onToggleHighlight(comment.id);
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-yellow-500 hover:bg-yellow-500/10 transition-colors flex items-center gap-2"
                      >
                        <Award size={12} />
                        {comment.isHighlighted ? 'Remove Highlight' : 'Highlight as Best'}
                      </button>
                    )}
                    {isAuthor && (
                      <button
                        onClick={() => onDelete(comment.id)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="text-neutral-300 text-[14px] leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-5 text-neutral-500 mb-2">
            {/* Compact Vote */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(VoteType.UPVOTE)}
                className={`p-1 rounded-md hover:bg-neutral-800 transition-colors group ${comment.userVote === 'UP' ? 'text-orange-500' : 'text-neutral-500 hover:text-orange-500'}`}
              >
                <ThumbsUp size={14} className="group-active:scale-125 transition-transform" fill={comment.userVote === 'UP' ? "currentColor" : "none"} />
              </button>
              <span className={`text-xs font-bold min-w-[12px] text-center ${comment.userVote === 'UP' ? 'text-orange-500' : comment.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-500'}`}>
                {comment.voteCount || 0}
              </span>
              <button
                onClick={() => handleVote(VoteType.DOWNVOTE)}
                className={`p-1 rounded-md hover:bg-neutral-800 transition-colors group ${comment.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-500 hover:text-indigo-500'}`}
              >
                <ThumbsDown size={14} className="group-active:scale-125 transition-transform" fill={comment.userVote === 'DOWN' ? "currentColor" : "none"} />
              </button>
            </div>

            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={14} />
              <span className="text-xs font-bold">Reply</span>
            </button>

            {/* Comment Reactions */}
            <CommentReactions
              commentId={comment.id}
              reactions={comment.reactions || { LIKE: 0, FUNNY: 0, HELPFUL: 0, INSIGHTFUL: 0, HEART: 0 }}
              userReaction={comment.userReaction}
              onReact={onReact}
              onRemoveReaction={onRemoveReaction}
              showAddButton={false}
            />
          </div>
        </div>
      </div>

      {/* Reply Box */}
      {showReplyBox && (
        <div className="ml-[52px] mt-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-200 relative z-20">
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Reply to this comment..."
              className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 focus:ring-1 focus:ring-white focus:border-white transition-all text-sm text-white placeholder:text-neutral-600 min-h-[80px]"
              autoFocus
            />
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setShowReplyBox(false)}
              className="px-3 py-1.5 text-neutral-500 rounded-lg text-xs font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              disabled={!replyContent.trim()}
              className="px-4 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Recursive Replies Container */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-[48px] relative">
          {/* Main vertical spine for this specific branch */}
          <div
            className="absolute left-[-28px] top-0 bottom-0 w-[2px] bg-neutral-800"
            style={{ display: isLast && comment.replies.length === 0 ? 'none' : 'block' }}
          />

          {comment.replies.map((reply, index) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onReply={onReply}
              onDelete={onDelete}
              onVote={onVote}
              onRemoveVote={onRemoveVote}
              onReact={onReact}
              onRemoveReaction={onRemoveReaction}
              onToggleHighlight={onToggleHighlight}
              depth={depth + 1}
              isLast={index === (comment.replies?.length || 0) - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId, postAuthorId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<CommentSortOption>('best');
  const { comments, loading, error, addComment, deleteComment, refresh } = useComments(postId, sortBy);
  const { voteComment, removeCommentVote } = useVoting();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = !!getAuthToken();

  // Build nested comment tree
  const commentTree = buildCommentTree(comments);

  const handleSortChange = (newSort: CommentSortOption) => {
    setSortBy(newSort);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      alert('Please log in to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await addComment({ content: newComment });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: VoteType) => {
    await voteComment(commentId, voteType);
    refresh();
  };

  const handleReact = async (commentId: string, reactionType: ReactionType) => {
    try {
      await discoverApi.reactToComment(commentId, reactionType);
      refresh();
    } catch (error) {
      console.error('Failed to react to comment:', error);
    }
  };

  const handleRemoveReaction = async (commentId: string) => {
    try {
      await discoverApi.removeCommentReaction(commentId);
      refresh();
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  const handleToggleHighlight = async (commentId: string) => {
    try {
      await discoverApi.toggleCommentHighlight(commentId);
      refresh();
    } catch (error) {
      console.error('Failed to toggle highlight:', error);
    }
  };

  const handleRemoveVote = async (commentId: string) => {
    await removeCommentVote(commentId);
    refresh();
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    if (!isAuthenticated) {
      // ideally show modal
      return;
    }

    try {
      await addComment({ content, parentCommentId });
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Error loading comments: {error}</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare size={18} />
          {comments.length} Comments
        </h3>

        {comments.length > 0 && (
          <CommentSortDropdown currentSort={sortBy} onSortChange={handleSortChange} />
        )}
      </div>

      {/* Add Comment Form */}
      <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-3xl p-1">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full bg-transparent border-none p-4 focus:ring-0 text-white placeholder:text-neutral-500 min-h-[100px]"
          rows={3}
        />
        <div className="flex justify-between items-center px-4 pb-3 pt-2 border-t border-neutral-800">
          <div className="text-xs font-bold text-neutral-500">
            Markdown supported
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {commentTree.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-500 font-bold mb-1">No comments yet</p>
            <p className="text-neutral-600 text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.user?.id}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onDelete={handleDelete}
              onVote={handleVote}
              onRemoveVote={handleRemoveVote}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              onToggleHighlight={handleToggleHighlight}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Comment Section Component
 * Display and manage comments with nested replies - Dark Mode
 */

'use client';

import { useState } from 'react';
import { Comment, VoteType } from '@/types/discover';
import { useComments, useVoting } from '@/hooks/useDiscover';
import VoteButtons from './VoteButtons';
import { getAuthToken } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Trash2, CornerDownRight } from 'lucide-react';

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
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onVote: (commentId: string, voteType: VoteType) => void;
  onRemoveVote: (commentId: string) => void;
}

function CommentItem({ comment, currentUserId, onReply, onDelete, onVote, onRemoveVote }: CommentItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const voteScore = comment.voteCount || 0;
  const isAuthenticated = !!getAuthToken();
  const isAuthor = currentUserId && comment.authorId === currentUserId;

  const handleVote = async (voteType: VoteType) => {
    if (!isAuthenticated) return;

    const backendVoteType = voteType === VoteType.UPVOTE ? 'UP' : 'DOWN';
    if (comment.userVote === backendVoteType) {
      await onRemoveVote(comment.id);
    } else {
      await onVote(comment.id, voteType);
    }
  };

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) return;
    onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyBox(false);
  };

  const isRoot = comment.depth === 0;

  return (
    <div className={`
      ${!isRoot ? 'ml-6 border-l-2 border-neutral-800 pl-4 mt-4 relative' : 'border-t border-neutral-800 mt-6 pt-6'}
    `}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          {/* Compact Vote for Comments */}
          <button onClick={() => handleVote(VoteType.UPVOTE)} className={`p-1 hover:bg-neutral-800 rounded ${comment.userVote === 'UP' ? 'text-orange-500' : 'text-neutral-500'}`}>▲</button>
          <span className={`text-xs font-bold ${comment.userVote === 'UP' ? 'text-orange-500' : comment.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-500'}`}>{voteScore}</span>
          <button onClick={() => handleVote(VoteType.DOWNVOTE)} className={`p-1 hover:bg-neutral-800 rounded ${comment.userVote === 'DOWN' ? 'text-indigo-500' : 'text-neutral-500'}`}>▼</button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-xs">
            {comment.author?.avatarUrl ? (
              <img
                src={comment.author.avatarUrl}
                alt={comment.author.displayName}
                className="w-6 h-6 rounded-full border border-neutral-800"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                {comment.author?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-white cursor-pointer hover:underline">{comment.author?.displayName}</span>
            <span className="text-neutral-600 font-bold">•</span>
            <span className="text-neutral-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {isAuthor && <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded text-[10px] font-bold">OP</span>}
          </div>

          <p className="text-neutral-300 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{comment.content}</p>

          <div className="flex gap-4 text-xs font-bold text-neutral-500">
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1.5 hover:bg-neutral-800 px-2 py-1 rounded transition-colors hover:text-white"
            >
              <MessageSquare size={14} /> Reply
            </button>
            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1.5 hover:bg-red-500/10 px-2 py-1 rounded transition-colors hover:text-red-500"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button className="hover:text-white transition-colors">Share</button>
            <button className="hover:text-white transition-colors">Report</button>
          </div>

          {showReplyBox && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 focus:ring-1 focus:ring-white focus:border-white transition-all text-sm text-white placeholder:text-neutral-600 min-h-[80px]"
                />
              </div>
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 text-neutral-400 rounded-lg text-xs font-bold hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                  className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  onVote={onVote}
                  onRemoveVote={onRemoveVote}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { comments, loading, error, addComment, deleteComment, refresh } = useComments(postId);
  const { voteComment, removeCommentVote } = useVoting();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = !!getAuthToken();

  // Build nested comment tree
  const commentTree = buildCommentTree(comments);

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
      <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
        <MessageSquare size={18} />
        {comments.length} Comments
      </h3>

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
              onReply={handleReply}
              onDelete={handleDelete}
              onVote={handleVote}
              onRemoveVote={handleRemoveVote}
            />
          ))
        )}
      </div>
    </div>
  );
}

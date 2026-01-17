/**
 * Discover Hooks
 * React hooks for posts, comments, voting, and communities
 */

'use client';

import { useState, useEffect } from 'react';
import { discoverApi } from '@/lib/discoverApi';
import {
  Post,
  PostListQuery,
  Comment,
  CreateCommentRequest,
  VoteType,
  Community,
  CommunityListQuery
} from '@/types/discover';

// ============ Posts Hooks ============

export function usePosts(query?: PostListQuery) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await discoverApi.getPosts({ ...query, page });
      setPosts(prev => page === 1 ? response.posts : [...prev, ...response.posts]);
      setHasMore(response.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, query?.sortBy, query?.communityId, query?.search]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchPosts();
  };

  return { posts, loading, error, hasMore, loadMore, refresh };
}

export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discoverApi.getPostById(postId);
      setPost(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  return { post, loading, error, refresh: fetchPost };
}

// ============ Voting Hooks ============

export function useVoting() {
  const [loading, setLoading] = useState(false);

  const votePost = async (postId: string, voteType: VoteType) => {
    setLoading(true);
    try {
      await discoverApi.votePost(postId, voteType);
    } catch (err) {
      console.error('Failed to vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePostVote = async (postId: string) => {
    setLoading(true);
    try {
      await discoverApi.removePostVote(postId);
    } catch (err) {
      console.error('Failed to remove vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const voteComment = async (commentId: string, voteType: VoteType) => {
    setLoading(true);
    try {
      await discoverApi.voteComment(commentId, voteType);
    } catch (err) {
      console.error('Failed to vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCommentVote = async (commentId: string) => {
    setLoading(true);
    try {
      await discoverApi.removeCommentVote(commentId);
    } catch (err) {
      console.error('Failed to remove vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { votePost, removePostVote, voteComment, removeCommentVote, loading };
}

// ============ Comments Hooks ============

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discoverApi.getComments(postId);
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const addComment = async (data: CreateCommentRequest) => {
    try {
      const newComment = await discoverApi.createComment(postId, data);
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await discoverApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      throw err;
    }
  };

  return { comments, loading, error, addComment, deleteComment, refresh: fetchComments };
}

// ============ Communities Hooks ============

export function useCommunities(query?: CommunityListQuery) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await discoverApi.getCommunities({ ...query, page });
      setCommunities(prev => page === 1 ? response.communities : [...prev, ...response.communities]);
      setHasMore(response.hasMore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [page, query?.sortBy, query?.search]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchCommunities();
  };

  return { communities, loading, error, hasMore, loadMore, refresh };
}

export function useCommunity(communityId: string) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discoverApi.getCommunityById(communityId);
      setCommunity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const joinCommunity = async () => {
    try {
      await discoverApi.joinCommunity(communityId);
      await fetchCommunity(); // Refresh to update isMember status
    } catch (err) {
      console.error('Failed to join community:', err);
      throw err;
    }
  };

  const leaveCommunity = async () => {
    try {
      await discoverApi.leaveCommunity(communityId);
      await fetchCommunity(); // Refresh to update isMember status
    } catch (err) {
      console.error('Failed to leave community:', err);
      throw err;
    }
  };

  return { community, loading, error, joinCommunity, leaveCommunity, refresh: fetchCommunity };
}

// ============ Saved Posts Hook ============

export function useSavedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await discoverApi.getSavedPosts();
      setPosts(response.posts); // Extract posts array from response
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const savePost = async (postId: string) => {
    try {
      await discoverApi.savePost(postId);
      await fetchSavedPosts();
    } catch (err) {
      console.error('Failed to save post:', err);
      throw err;
    }
  };

  const unsavePost = async (postId: string) => {
    try {
      await discoverApi.unsavePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to unsave post:', err);
      throw err;
    }
  };

  return { posts, loading, error, savePost, unsavePost, refresh: fetchSavedPosts };
}

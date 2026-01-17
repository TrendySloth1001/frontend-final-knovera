/**
 * Discover API Client
 * API calls for posts, comments, voting, and communities
 */

import { apiClient, getAuthToken } from './api';
import {
  Post,
  PostListQuery,
  PostListResponse,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  VoteType,
  Community,
  CommunityListQuery,
  CommunityListResponse,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunityMember,
  CommunityRole,
  ReportRequest
} from '@/types/discover';

const BASE_PATH = '/api/discover';

// Posts
export const discoverApi = {
  // ============ Posts ============

  async getPosts(query?: PostListQuery): Promise<PostListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.authorId) params.append('authorId', query.authorId);
    if (query?.communityId) params.append('communityId', query.communityId);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.search) params.append('search', query.search);

    return apiClient.get<PostListResponse>(
      `${BASE_PATH}/posts?${params.toString()}`
    );
  },

  async getPostById(postId: string): Promise<Post> {
    return apiClient.get<Post>(`${BASE_PATH}/posts/${postId}`);
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return apiClient.post<Post>(`${BASE_PATH}/posts`, data);
  },

  async updatePost(postId: string, data: UpdatePostRequest): Promise<Post> {
    return apiClient.put<Post>(`${BASE_PATH}/posts/${postId}`, data);
  },

  async deletePost(postId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/posts/${postId}`);
  },

  async uploadPostMedia(postId: string, file: File): Promise<Post> {
    const formData = new FormData();
    formData.append('media', file);

    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_PATH}/posts/${postId}/media`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    return response.json();
  },

  async deleteMedia(mediaId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/media/${mediaId}`);
  },

  // ============ Voting ============

  async votePost(postId: string, voteType: VoteType): Promise<void> {
    // Backend expects 'UP' or 'DOWN', not 'UPVOTE' or 'DOWNVOTE'
    const backendVoteType = voteType === VoteType.UPVOTE ? 'UP' : 'DOWN';
    return apiClient.post(`${BASE_PATH}/posts/${postId}/vote`, { voteType: backendVoteType });
  },

  async removePostVote(postId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/posts/${postId}/vote`);
  },

  async voteComment(commentId: string, voteType: VoteType): Promise<void> {
    // Backend expects 'UP' or 'DOWN', not 'UPVOTE' or 'DOWNVOTE'
    const backendVoteType = voteType === VoteType.UPVOTE ? 'UP' : 'DOWN';
    return apiClient.post(`${BASE_PATH}/comments/${commentId}/vote`, { voteType: backendVoteType });
  },

  async removeCommentVote(commentId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/comments/${commentId}/vote`);
  },

  // ============ Comments ============

  async getComments(postId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`${BASE_PATH}/posts/${postId}/comments`);
  },

  async createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>(`${BASE_PATH}/posts/${postId}/comments`, data);
  },

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    return apiClient.put<Comment>(`${BASE_PATH}/comments/${commentId}`, data);
  },

  async deleteComment(commentId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/comments/${commentId}`);
  },

  // ============ Saved Posts ============

  async savePost(postId: string): Promise<void> {
    return apiClient.post(`${BASE_PATH}/posts/${postId}/save`);
  },

  async unsavePost(postId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/posts/${postId}/save`);
  },

  async getSavedPosts(): Promise<PostListResponse> {
    return apiClient.get<PostListResponse>(`${BASE_PATH}/saved`);
  },

  // ============ Reporting ============

  async reportPost(postId: string, data: ReportRequest): Promise<void> {
    return apiClient.post(`${BASE_PATH}/posts/${postId}/report`, data);
  },

  async reportComment(commentId: string, data: ReportRequest): Promise<void> {
    return apiClient.post(`${BASE_PATH}/comments/${commentId}/report`, data);
  },

  // ============ Communities ============

  async getCommunities(query?: CommunityListQuery): Promise<CommunityListResponse> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.sortBy) params.append('sortBy', query.sortBy);

    return apiClient.get<CommunityListResponse>(
      `${BASE_PATH}/communities?${params.toString()}`
    );
  },

  async getCommunityById(communityId: string): Promise<Community> {
    return apiClient.get<Community>(`${BASE_PATH}/communities/${communityId}`);
  },

  async createCommunity(data: CreateCommunityRequest): Promise<Community> {
    return apiClient.post<Community>(`${BASE_PATH}/communities`, data);
  },

  async updateCommunity(communityId: string, data: UpdateCommunityRequest): Promise<Community> {
    return apiClient.put<Community>(`${BASE_PATH}/communities/${communityId}`, data);
  },

  async deleteCommunity(communityId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/communities/${communityId}`);
  },



  async joinCommunity(communityId: string): Promise<void> {
    return apiClient.post(`${BASE_PATH}/communities/${communityId}/join`);
  },

  async leaveCommunity(communityId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/communities/${communityId}/leave`);
  },

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    return apiClient.get<CommunityMember[]>(`${BASE_PATH}/communities/${communityId}/members`);
  },

  async updateMemberRole(communityId: string, userId: string, role: CommunityRole): Promise<void> {
    return apiClient.patch(`${BASE_PATH}/communities/${communityId}/members/${userId}/role`, { role });
  },

  async removeMember(communityId: string, userId: string): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/communities/${communityId}/members/${userId}`);
  },

  async uploadCommunityAvatar(communityId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_PATH}/communities/${communityId}/avatar`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  },

  async uploadCommunityBackground(communityId: string, file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('background', file);

    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${BASE_PATH}/communities/${communityId}/background`, {
      method: 'POST',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload background');
    }

    return response.json();
  },

  async getUserCommunities(userId: string): Promise<Community[]> {
    const response = await apiClient.get<{ communities: Community[] }>(
      `${BASE_PATH}/users/${userId}/communities`
    );
    return response.communities;
  }
};

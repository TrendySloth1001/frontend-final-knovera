/**
 * Discover Feature Types
 * Types for posts, comments, communities, and voting
 */

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO'
}

export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  LINK = 'LINK',
  MIXED = 'MIXED'
}

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  MEMBERS_ONLY = 'MEMBERS_ONLY'
}

export enum CommunityRole {
  CREATOR = 'CREATOR',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  VIOLENCE = 'VIOLENCE',
  MISINFORMATION = 'MISINFORMATION',
  OTHER = 'OTHER'
}

// Post Types
export interface PostMedia {
  id: string;
  url: string;
  type: MediaType;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  description?: string;
  postType?: PostType;
  visibility?: PostVisibility;
  authorId: string;
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  communityId?: string;
  community?: Community;
  linkUrl?: string;
  media: PostMedia[];
  tags?: string[];
  voteCount: number;
  commentCount: number;
  viewCount?: number;
  userVote?: 'UP' | 'DOWN' | null;
  isSaved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  description?: string;
  postType: PostType;
  visibility?: PostVisibility;
  tags?: string[];
  communityId?: string;
  linkUrl?: string;
}

export interface UpdatePostRequest {
  title?: string;
  description?: string;
  visibility?: PostVisibility;
  tags?: string[];
}

export interface PostListQuery {
  page?: number;
  limit?: number;
  authorId?: string;
  communityId?: string;
  sortBy?: 'hot' | 'new' | 'top' | 'trending';
  search?: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  parentCommentId?: string;
  replies?: Comment[];
  depth: number;
  voteCount: number;
  userVote?: 'UP' | 'DOWN' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Community Types
export interface Community {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  avatarUrl?: string;
  bannerUrl?: string;
  rules?: string;
  visibility: PostVisibility;
  allowMemberPosts: boolean;
  requireApproval: boolean;
  memberCount: number;
  postCount: number;
  userRole?: CommunityRole;
  isMember: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  rules?: string;
  visibility?: PostVisibility;
  allowMemberPosts?: boolean;
  requireApproval?: boolean;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  rules?: string;
  visibility?: PostVisibility;
  allowMemberPosts?: boolean;
  requireApproval?: boolean;
}

export interface CommunityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'new' | 'popular' | 'name';
}

export interface CommunityListResponse {
  communities: Community[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CommunityMember {
  id: string;
  userId: string;
  role: CommunityRole;
  joinedAt: Date;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
}

// Report Types
export interface ReportRequest {
  reason: ReportReason;
  details?: string;
}

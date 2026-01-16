/**
 * Chat Types - P2P Messaging System
 * Type definitions for chat functionality
 */

export interface ChatUser {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  email?: string;
  isOnline?: boolean;
  lastActiveAt?: string | null;
  role?: 'teacher' | 'student';
}

export interface ChatConversation {
  [x: string]: any;
  id: string;
  name: string | null;
  avatarUrl?: string | null;  // Group avatar
  description?: string | null;  // Group description
  rules?: string | null;  // Group rules
  isGroup: boolean;
  createdBy: string;
  creator?: ChatUser;

  // Group settings
  adminOnlyMessaging?: boolean;
  approvalRequired?: boolean;
  allowMemberInvite?: boolean;
  allowMemberSettings?: boolean;

  members: Array<{
    userId: string;
    user: ChatUser;
    role?: 'admin' | 'moderator' | 'member';
    isPinned?: boolean;
    joinedAt: string;
    isBanned?: boolean;
    bannedAt?: string | null;
    banReason?: string | null;
  }>;
  lastMessage?: ChatMessage | null;
  isPinned?: boolean;
  unreadCount?: number; // Real-time unread count from WebSocket
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  user?: ChatUser;
  username?: string;
  content: string;
  messageType?: 'user' | 'system_user_joined' | 'system_user_left' | 'system_group_created' | 'announcement';
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaUrls?: string[];  // Multiple media URLs
  mediaTypes?: string[];  // Corresponding media types

  // Message enhancements
  isEdited?: boolean;
  editedAt?: string | null;
  deletedForEveryone?: boolean;
  reactions?: MessageReaction[];
  isStarred?: boolean;
  isAnnouncement?: boolean;
  isPinned?: boolean;
  mentions?: string[];  // Array of userIds mentioned

  // Advanced features
  linkPreview?: LinkPreview;
  poll?: Poll;
  sharedContact?: SharedContact;

  createdAt: string;
  seenBy?: Array<{
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string; // Optional because backend might not send it if null
    seenAt: string;
  }>;
  replyToId?: string | null;
  replyToMessage?: {
    id: string;
    content: string;
    userId: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    mediaUrls?: string[];
    mediaTypes?: string[];
    user: {
      id: string;
      displayName: string;
    };
  } | null;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: Array<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
  }>;
  userReacted: boolean;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string | null;
}

export interface CreateConversationPayload {
  name?: string;
  creatorId: string;
  memberIds: string[];
  isGroup: boolean;
}

export interface SendMessagePayload {
  conversationId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  replyToId?: string;
}

// WebSocket message types
export interface IncomingClientMessage {
  type: 'join_conversation' | 'leave_conversation' | 'send_message' | 'typing' | 'seen';
  data: {
    conversationId?: string;
    userId?: string;
    content?: string;
    isTyping?: boolean;
    messageId?: string;
  };
}

// ==================== GROUP MANAGEMENT TYPES ====================

export interface GroupInviteLink {
  id: string;
  conversationId: string;
  code: string;
  createdBy: string;
  creator?: { id: string; displayName: string; username?: string | null };
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GroupJoinRequest {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  status: 'pending' | 'approved' | 'rejected';
  message?: string | null;
  respondedBy?: string | null;
  responder?: { id: string; displayName: string } | null;
  respondedAt?: string | null;
  createdAt: string;
  requiresApproval?: boolean;
}

export interface PinnedMessage {
  id: string;
  conversationId: string;
  messageId: string;
  message: ChatMessage;
  pinnedBy: string;
  user: { id: string; displayName: string };
  pinnedAt: string;
}

export interface GroupMember {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  role: 'admin' | 'moderator' | 'member';
  isBanned: boolean;
  bannedAt?: string | null;
  bannedBy?: string | null;
  banner?: { id: string; displayName: string } | null;
  banReason?: string | null;
  joinedAt: string;
  isPinned: boolean;
  lastRead?: string | null;
}

export interface GroupSettings {
  name?: string;
  description?: string;
  rules?: string;
  adminOnlyMessaging?: boolean;
  approvalRequired?: boolean;
  allowMemberInvite?: boolean;
  allowMemberSettings?: boolean;
}

export interface ServerMessage {
  type: 'connected' | 'conversation_joined' | 'conversation_left' | 'new_message' | 'typing' | 'message_seen' | 'user_online' | 'user_offline' | 'conversation_created' | 'error';
  data: any;
}

export type LinkPreview = any;

export interface Poll {
  id: string;
  messageId: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  createdBy: string;
  creator: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  expiresAt?: string;
  votes: PollVote[];
  createdAt: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  optionIndex: number;
  votedAt: string;
}

export type SharedContact = any;

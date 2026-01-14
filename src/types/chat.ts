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
  isGroup: boolean;
  createdBy: string;
  creator?: ChatUser;
  members: Array<{
    userId: string;
    user: ChatUser;
    isPinned?: boolean;
    joinedAt: string;
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
  messageType?: 'user' | 'system_user_joined' | 'system_user_left' | 'system_group_created';
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  seenBy?: Array<{
    userId: string;
    username: string;
    seenAt: string;
  }>;
  replyToId?: string | null;
  replyToMessage?: {
    id: string;
    content: string;
    userId: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    user: {
      id: string;
      displayName: string;
    };
  } | null;
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

export interface ServerMessage {
  type: 'connected' | 'conversation_joined' | 'conversation_left' | 'new_message' | 'typing' | 'message_seen' | 'user_online' | 'user_offline' | 'conversation_created' | 'error';
  data: any;
}

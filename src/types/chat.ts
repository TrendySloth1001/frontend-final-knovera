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
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  seenBy?: Array<{
    userId: string;
    username: string;
    seenAt: string;
  }>;
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
  type: 'connected' | 'conversation_joined' | 'conversation_left' | 'new_message' | 'typing' | 'message_seen' | 'user_online' | 'user_offline' | 'error';
  data: any;
}

/**
 * Chat Types - Peer-to-peer messaging
 */

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

export interface ChatConversation {
  id: string;
  name?: string;
  isGroup: boolean;
  createdBy: string;
  members: ChatConversationMember[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  joinedAt: string;
  isPinned: boolean;
  lastRead?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  seenBy?: MessageSeen[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageSeen {
  id: string;
  messageId: string;
  userId: string;
  user: ChatUser;
  seenAt: string;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'seen' | 'online' | 'error';
  data: any;
}

export interface CreateConversationPayload {
  name?: string;
  isGroup: boolean;
  memberUserIds: string[];
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
}

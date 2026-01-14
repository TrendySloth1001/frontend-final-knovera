/**
 * Messages API Client - P2P Chat System
 * Complete API client for all chat endpoints
 */

import { 
  ChatUser, 
  ChatConversation, 
  ChatMessage,
  OnlineStatus,
  CreateConversationPayload,
  SendMessagePayload 
} from '@/types/chat';

// Get API base URL - chat API is on port 3001
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
  : 'http://localhost:3001/api/chat';

/**
 * API Response Types
 */
interface UnreadCountResponse {
  unreadCount: number;
}

interface MessageSeenResponse {
  messageId: string;
  userId: string;
  alreadySeen: boolean;
  seenAt: string;
}

interface MediaUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface SearchMessagesResponse {
  results: ChatMessage[];
  count: number;
}

interface ApiError {
  error: string;
}

/**
 * Messages API Class
 */
class MessagesAPI {
  /**
   * Get headers with authorization token
   */
  private getHeaders(token: string, isMultipart = false): HeadersInit {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    };
    
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  /**
   * Check if response is ok, throw error if not
   */
  private async checkResponse(response: Response): Promise<void> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If not JSON, use the text or default message
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response, defaultMessage: string): Promise<never> {
    let errorMessage = defaultMessage;
    
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.error || defaultMessage;
    } catch {
      // If parsing fails, use status text or default message
      errorMessage = response.statusText || defaultMessage;
    }
    
    throw new Error(errorMessage);
  }

  /**
   * Update user chat info (set username)
   */
  async updateUserChatInfo(token: string, username: string): Promise<ChatUser> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to update user info');
    }

    return response.json();
  }

  /**
   * Get all users
   */
  async getAllUsers(token: string): Promise<ChatUser[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch users');
    }

    return response.json();
  }

  /**
   * Get mutual followers (users who follow each other)
   */
  async getMutualFollowers(token: string): Promise<ChatUser[]> {
    const response = await fetch(`${API_BASE_URL}/users/mutual-followers`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch mutual followers');
    }

    return response.json();
  }

  /**
   * Get online users
   */
  async getOnlineUsers(token: string): Promise<ChatUser[]> {
    const response = await fetch(`${API_BASE_URL}/users/online`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch online users');
    }

    return response.json();
  }

  /**
   * Get user by username
   */
  async getUserByUsername(token: string, username: string): Promise<ChatUser> {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch user');
    }

    return response.json();
  }

  /**
   * Get user by ID
   */
  async getUserById(token: string, userId: string): Promise<ChatUser> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch user');
    }

    return response.json();
  }

  /**
   * Get user status (online/offline)
   */
  async getUserStatus(token: string, userId: string): Promise<OnlineStatus> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch user status');
    }

    return response.json();
  }

  /**
   * Get batch user status
   */
  async getBatchUserStatus(token: string, userIds: string[]): Promise<OnlineStatus[]> {
    const response = await fetch(`${API_BASE_URL}/users/status/batch`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch user statuses');
    }

    return response.json();
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(token: string, userId: string): Promise<UnreadCountResponse> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/unread-count`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch unread count');
    }

    return response.json();
  }
  /**
   * Create new conversation (group or 1-to-1)
   */
  async createConversation(token: string, payload: CreateConversationPayload): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to create conversation');
    }

    return response.json();
  }

  /**
   * Get or create one-to-one conversation
   */
  async checkOrCreateOneToOne(token: string, otherUserId: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/one-to-one`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to get or create conversation');
    }

    return response.json();
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(token: string, userId: string): Promise<ChatConversation[]> {
    console.log('[MessagesAPI] Fetching conversations for user:', userId);
    console.log('[MessagesAPI] API URL:', `${API_BASE_URL}/users/${userId}/conversations`);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/conversations`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    console.log('[MessagesAPI] Response status:', response.status, response.statusText);

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch conversations');
    }

    const data = await response.json();
    console.log('[MessagesAPI] Received conversations:', Array.isArray(data) ? data.length : 'not an array', data);
    return data;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(token: string, conversationId: string, userId: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?userId=${userId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch conversation');
    }

    return response.json();
  }

  /**
   * Get conversation members
   */
  async getConversationMembers(token: string, conversationId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch conversation members');
    }

    return response.json();
  }

  /**
   * Get conversation members status
   */
  async getConversationMembersStatus(token: string, conversationId: string): Promise<OnlineStatus[]> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members/status`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch members status');
    }

    return response.json();
  }

  /**
   * Add members to group conversation
   */
  // async addMembers(token: string, conversationId: string, userIds: string[], requesterId: string): Promise<void> {
  //   const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members`, {
  //     method: 'POST',
  //     headers: this.getHeaders(token),
  //     body: JSON.stringify({ userIds, requesterId }),
  //   });

  //   if (!response.ok) {
  //     await this.handleError(response, 'Failed to add members');
  //   }
  // }

  // /**
  //  * Remove member from group conversation
  //  */
  // async removeMember(token: string, conversationId: string, userId: string, requesterId: string): Promise<void> {
  //   const response = await fetch(
  //     `${API_BASE_URL}/conversations/${conversationId}/members/${userId}?requesterId=${requesterId}`,
  //     {
  //       method: 'DELETE',
  //       headers: this.getHeaders(token),
  //     }
  //   );

  //   if (!response.ok) {
  //     await this.handleError(response, 'Failed to remove member');
  //   }
  // }

  /**
   * Update group conversation name
   */
  async updateConversationName(token: string, conversationId: string, name: string, requesterId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/name`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ name, requesterId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to update conversation name');
    }
  }

  /**
   * Leave group conversation
   */
  async leaveConversation(token: string, conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to leave conversation');
    }
  }

  /**
   * Clear conversation (delete all messages for user)
   */
  async clearConversation(token: string, conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/clear`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to clear conversation');
    }
  }

  /**
   * Pin or unpin conversation
   */
  async pinConversation(token: string, conversationId: string, userId: string, isPinned: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/pin`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId, isPinned }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to pin conversation');
    }
  }


  /**
   * Send text message
   */
  async sendMessage(token: string, payload: SendMessagePayload): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Get messages from conversation
   */
  async getMessages(
    token: string, 
    conversationId: string, 
    limit = 50, 
    before?: string
  ): Promise<ChatMessage[]> {
    let url = `${API_BASE_URL}/conversations/${conversationId}/messages?limit=${limit}`;
    
    if (before) {
      url += `&before=${before}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch messages');
    }

    return response.json();
  }

  /**
   * Mark message as seen
   */
  async markMessageSeen(token: string, messageId: string): Promise<MessageSeenResponse> {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/seen`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to mark message as seen');
    }

    return response.json();
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(
    token: string, 
    conversationId: string, 
    query: string, 
    limit = 20
  ): Promise<SearchMessagesResponse> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );

    if (!response.ok) {
      await this.handleError(response, 'Failed to search messages');
    }

    return response.json();
  }


  /**
   * Upload media file
   */
  async uploadMedia(token: string, file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: this.getHeaders(token, true), // multipart form
      body: formData,
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to upload media');
    }

    return response.json();
  }

  /**
   * Send media message
   */
  async sendMediaMessage(
    token: string, 
    conversationId: string, 
    mediaUrl: string, 
    mediaType: string,
    content?: string
  ): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/messages/media`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({
        conversationId,
        mediaUrl,
        mediaType,
        content,
      }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to send media message');
    }

    return response.json();
  }

  /**
   * Upload and send media in one call
   */
  async uploadAndSendMedia(
    token: string, 
    conversationId: string, 
    file: File,
    caption?: string
  ): Promise<ChatMessage> {
    // First upload the media
    const uploadResult = await this.uploadMedia(token, file);
    
    // Then send as message
    return this.sendMediaMessage(
      token,
      conversationId,
      uploadResult.url,
      uploadResult.mimetype,
      caption
    );
  }

  /**
   * Start or get existing 1-to-1 chat with user
   */
  async startChatWithUser(token: string, otherUserId: string): Promise<ChatConversation> {
    return this.checkOrCreateOneToOne(token, otherUserId);
  }

  /**
   * Create a study group
   */
  async createStudyGroup(
    token: string, 
    name: string, 
    creatorId: string, 
    memberIds: string[]
  ): Promise<ChatConversation> {
    return this.createConversation(token, {
      name,
      creatorId,
      memberIds,
      isGroup: true,
    });
  }

  /**
   * Get all unread messages across conversations
   */
  async getAllUnreadCount(token: string, userId: string): Promise<number> {
    const result = await this.getUnreadCount(token, userId);
    return result.unreadCount;
  }

  /**
   * Load more messages (pagination)
   */
  async loadMoreMessages(
    token: string, 
    conversationId: string, 
    oldestMessageId: string,
    limit = 50
  ): Promise<ChatMessage[]> {
    return this.getMessages(token, conversationId, limit, oldestMessageId);
  }

  /**
   * Check if user is online
   */
  async isUserOnline(token: string, userId: string): Promise<boolean> {
    const status = await this.getUserStatus(token, userId);
    return status.isOnline;
  }

  /**
   * Get online members of a conversation
   */
  async getOnlineMembers(token: string, conversationId: string): Promise<OnlineStatus[]> {
    const statuses = await this.getConversationMembersStatus(token, conversationId);
    return statuses.filter(status => status.isOnline);
  }

  /**
   * Create a group conversation with mutual followers check
   */
  async createGroupConversation(token: string, name: string, memberIds: string[]): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/group`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ name, memberIds }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to create group conversation');
    }

    return response.json();
  }

  /**
   * Add members to a group conversation
   */
  async addMembers(token: string, conversationId: string, userIds: string[], requesterId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userIds, requesterId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to add members');
    }

    return response.json();
  }

  /**
   * Remove a member from a group conversation
   */
  async removeMember(token: string, conversationId: string, userId: string, requesterId: string): Promise<{ success: boolean; userId: string }> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
      body: JSON.stringify({ requesterId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to remove member');
    }

    return response.json();
  }

  /**
   * Update group name
   */
  async updateGroupName(token: string, conversationId: string, name: string, requesterId: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/name`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ name, requesterId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to update group name');
    }

    return response.json();
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(token: string, conversationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to delete conversation');
    }

    return response.json();
  }

  /**
   * Leave a group conversation
   */
  async leaveGroup(token: string, conversationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to leave group');
    }

    return response.json();
  }
}

// Export singleton instance
export const messagesAPI = new MessagesAPI();

// Export class for custom instances
export { MessagesAPI };

// Export types for convenience
export type {
  UnreadCountResponse,
  MessageSeenResponse,
  MediaUploadResponse,
  SearchMessagesResponse,
};

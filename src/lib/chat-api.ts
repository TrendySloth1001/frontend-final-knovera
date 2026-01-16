/**
 * Chat API Service - Peer-to-peer messaging
 */

import {
  ChatUser,
  ChatConversation,
  ChatMessage,
  CreateConversationPayload,
  SendMessagePayload
} from '@/types/chat';

const API_BASE_URL = 'http://localhost:3001/api/chat';

class ChatAPI {
  private getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleError(response: Response, defaultMessage: string): Promise<never> {
    try {
      const data = await response.json();
      // Handle different error response formats
      const message = data.message || data.error?.message || data.error || defaultMessage;
      throw new Error(message);
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error(defaultMessage);
    }
  }

  // User endpoints
  async createChatUser(token: string, username: string): Promise<ChatUser> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to create chat user');
    }

    return response.json();
  }

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

  async getUserConversations(token: string, userId: string): Promise<ChatConversation[]> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/conversations`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch conversations');
    }

    return response.json();
  }

  async getUnreadCount(token: string, userId: string): Promise<{ unreadCount: number }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/unread-count`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch unread count');
    }

    return response.json();
  }

  // Conversation endpoints
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

  async getOrCreateOneToOne(token: string, otherUserId: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/one-to-one`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to create conversation');
    }

    return response.json();
  }

  async getConversation(token: string, conversationId: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch conversation');
    }

    return response.json();
  }

  async addMembers(token: string, conversationId: string, userIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to add members');
    }
  }

  async removeMember(token: string, conversationId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to remove member');
    }
  }

  async updateConversationName(token: string, conversationId: string, name: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/name`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to update conversation name');
    }
  }

  async pinConversation(token: string, conversationId: string, isPinned: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/pin`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ isPinned }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to pin conversation');
    }
  }

  async leaveConversation(token: string, conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/leave`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to leave conversation');
    }
  }

  // Message endpoints
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

  async getMessages(token: string, conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: this.getHeaders(token),
      }
    );

    if (!response.ok) {
      await this.handleError(response, 'Failed to fetch messages');
    }

    return response.json();
  }

  async markMessageSeen(token: string, messageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/seen`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to mark message as seen');
    }
  }

  async uploadMedia(token: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('media', file);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to upload media');
    }

    return response.json();
  }

  async saveDraft(token: string, conversationId: string, draft: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/draft`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ draft }),
    });

    if (!response.ok) {
      await this.handleError(response, 'Failed to save draft');
    }
  }
}

export const chatAPI = new ChatAPI();

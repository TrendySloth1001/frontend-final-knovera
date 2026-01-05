/**
 * AI API Client
 */

import { apiClient } from './api';

export interface Message {
  id: string;
  conversationId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  retrievedDocs?: any;
  thoughtTags?: string; // Comma-separated thought tags
  tokensUsed?: number;
  embedding?: string; // JSON stringified embedding array
  sequenceNumber: number;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId?: string;
  teacherId?: string;
  studentId?: string;
  title?: string;
  topic?: string;
  sessionType: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  messages?: Message[];
}

export interface GenerateTextRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  conversationId?: string;
  userId?: string;
  teacherId?: string;
  studentId?: string;
  useRAG?: boolean;
  ragTopK?: number;
  sessionType?: 'chat' | 'tutoring' | 'question-gen' | 'syllabus';
  topic?: string;
  webSearch?: boolean;
  stream?: boolean;
}

export interface GenerateTextResponse {
  response: string;
  conversationId: string;
  messageId: string;
  tokensUsed?: number;
  sourceDocuments?: Array<{
    text: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  webSearchResults?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const aiAPI = {
  // Generate text (chat)
  async generate(data: GenerateTextRequest): Promise<GenerateTextResponse> {
    const response = await apiClient.post<ApiResponse<GenerateTextResponse>>('/api/ai/generate', data);
    return response.data;
  },

  // Get user conversations
  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(`/api/ai/conversations?userId=${userId}`);
    return response.data;
  },

  // Get single conversation
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<ApiResponse<Conversation>>(`/api/ai/conversations/${conversationId}`);
    return response.data;
  },

  // Get conversation messages
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<ApiResponse<Message[]>>(`/api/ai/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/ai/conversations/${conversationId}`);
  },

  // Search conversations
  async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(`/api/ai/conversations/search?userId=${userId}&query=${query}`);
    return response.data;
  },

  // Authless form helper (rate limited: 10 requests/hour per IP)
  async helpFormField(request: {
    fieldType: 'bio' | 'description' | 'interests' | 'specialization' | string;
    context?: string;
    maxLength?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      fieldType: string;
      suggestion: string;
      characterCount: number;
    };
  }> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/helper/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },
};

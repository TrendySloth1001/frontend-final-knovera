import { apiClient } from './api';
import { Poll } from '@/types/chat';

const CHAT_BASE_URL = '/api/chat';

// ==================== CREATE POLL ====================

export const createPoll = async (
  messageId: string,
  question: string,
  options: string[],
  allowMultiple: boolean = false,
  expiresAt?: string
) => {
  return await apiClient.post<Poll>(`${CHAT_BASE_URL}/polls`, {
    messageId,
    question,
    options,
    allowMultiple,
    expiresAt,
  });
};

// ==================== GET POLL ====================

export const getPoll = async (pollId: string) => {
  return await apiClient.get<Poll>(`${CHAT_BASE_URL}/polls/${pollId}`);
};

// ==================== VOTE ON POLL ====================

export const votePoll = async (pollId: string, optionIndices: number[]) => {
  return await apiClient.post<Poll>(`${CHAT_BASE_URL}/polls/${pollId}/vote`, {
    optionIndices,
  });
};

// ==================== DELETE POLL ====================

export const deletePoll = async (pollId: string) => {
  return await apiClient.delete(`${CHAT_BASE_URL}/polls/${pollId}`);
};

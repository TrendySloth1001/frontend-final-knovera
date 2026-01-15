import { apiClient } from './api';

export interface DiscoverableGroup {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  isPublic: boolean;
  approvalRequired: boolean;
  createdBy: string;
  creator: {
    displayName: string;
    avatarUrl: string | null;
    username: string | null;
  };
  isMember: boolean;
  hasRequestedJoin: boolean;
}

const CHAT_BASE_URL = '/api/chat';

export const discoverGroups = async (
  category?: string,
  search?: string,
  limit: number = 20,
  offset: number = 0
): Promise<DiscoverableGroup[]> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const response = await apiClient.get<DiscoverableGroup[]>(
    `${CHAT_BASE_URL}/groups/discover?${params.toString()}`
  );
  return response.data;
};

export const searchGroups = async (query: string, limit: number = 20): Promise<DiscoverableGroup[]> => {
  const response = await apiClient.get<DiscoverableGroup[]>(
    `${CHAT_BASE_URL}/groups/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data;
};

import { apiClient as api } from './api';
import { GroupInviteLink, GroupJoinRequest, PinnedMessage, GroupMember, GroupSettings } from '@/types/chat';

const CHAT_BASE_URL = '/api/chat';

// ==================== ADMIN ROLES & PERMISSIONS ====================

export const updateMemberRole = async (
  conversationId: string,
  targetUserId: string,
  newRole: 'admin' | 'moderator' | 'member'
) => {
  return await api.patch(
    `${CHAT_BASE_URL}/conversations/${conversationId}/members/${targetUserId}/role`,
    { role: newRole }
  );
};

// ==================== GROUP SETTINGS ====================

export const updateGroupSettings = async (
  conversationId: string,
  settings: GroupSettings
) => {
  return await api.patch(
    `${CHAT_BASE_URL}/conversations/${conversationId}/settings`,
    settings
  );
};

// ==================== KICK & BAN MEMBERS ====================

export const kickMember = async (conversationId: string, targetUserId: string) => {
  return await api.delete(
    `${CHAT_BASE_URL}/conversations/${conversationId}/members/${targetUserId}/kick`
  );
};

export const banMember = async (
  conversationId: string,
  targetUserId: string,
  reason?: string
) => {
  return await api.post(
    `${CHAT_BASE_URL}/conversations/${conversationId}/members/${targetUserId}/ban`,
    { reason }
  );
};

export const unbanMember = async (conversationId: string, targetUserId: string) => {
  return await api.delete(
    `${CHAT_BASE_URL}/conversations/${conversationId}/members/${targetUserId}/ban`
  );
};

// ==================== INVITE LINKS ====================

export const createInviteLink = async (
  conversationId: string,
  maxUses?: number,
  expiresInHours?: number
) => {
  return await api.post<GroupInviteLink>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/invite-links`,
    { maxUses, expiresInHours }
  );
};

export const getInviteLinks = async (conversationId: string) => {
  return await api.get<GroupInviteLink[]>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/invite-links`
  );
};

export const revokeInviteLink = async (linkId: string) => {
  return await api.delete(`${CHAT_BASE_URL}/invite-links/${linkId}`);
};

export const joinViaInviteLink = async (code: string) => {
  return await api.post(`${CHAT_BASE_URL}/join-via-invite`, { code });
};

// ==================== JOIN REQUESTS ====================

export const createJoinRequest = async (
  conversationId: string,
  message?: string
) => {
  return await api.post<GroupJoinRequest>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/join-requests`,
    { message }
  );
};

export const getJoinRequests = async (conversationId: string) => {
  return await api.get<GroupJoinRequest[]>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/join-requests`
  );
};

export const respondToJoinRequest = async (
  requestId: string,
  approve: boolean
) => {
  return await api.post(
    `${CHAT_BASE_URL}/join-requests/${requestId}/respond`,
    { approve }
  );
};

// ==================== PINNED MESSAGES ====================

export const pinMessage = async (conversationId: string, messageId: string) => {
  return await api.post(
    `${CHAT_BASE_URL}/conversations/${conversationId}/messages/${messageId}/pin`
  );
};

export const unpinMessage = async (conversationId: string, messageId: string) => {
  return await api.delete(
    `${CHAT_BASE_URL}/conversations/${conversationId}/messages/${messageId}/pin`
  );
};

export const getPinnedMessages = async (conversationId: string) => {
  return await api.get<PinnedMessage[]>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/pinned-messages`
  );
};

// ==================== ANNOUNCEMENTS ====================

export const sendAnnouncement = async (
  conversationId: string,
  content: string
) => {
  return await api.post(
    `${CHAT_BASE_URL}/conversations/${conversationId}/announcements`,
    { content }
  );
};

export const getAnnouncements = async (conversationId: string) => {
  return await api.get(
    `${CHAT_BASE_URL}/conversations/${conversationId}/announcements`
  );
};



// ==================== MEMBER LIST ====================

export const getGroupMembers = async (conversationId: string, search?: string) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return await api.get<GroupMember[]>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/members${query}`
  );
};

export const getBannedMembers = async (conversationId: string) => {
  return await api.get<GroupMember[]>(
    `${CHAT_BASE_URL}/conversations/${conversationId}/banned-members`
  );
};

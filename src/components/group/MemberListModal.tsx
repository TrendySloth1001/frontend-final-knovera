'use client';

import { useState, useEffect } from 'react';
import { X, Search, Crown, Shield, User, MoreVertical, UserX, Ban, UserCheck } from 'lucide-react';
import { ChatConversation, GroupMember } from '@/types/chat';
import { getGroupMembers, updateMemberRole, kickMember, banMember } from '@/lib/groupManagementApi';

interface MemberListModalProps {
  conversation: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onMemberUpdate: () => void;
}

export default function MemberListModal({
  conversation,
  isOpen,
  onClose,
  currentUserId,
  onMemberUpdate,
}: MemberListModalProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentMember = conversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canManage = isAdmin || isModerator;

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, conversation.id]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getGroupMembers(conversation.id, searchQuery);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadMembers();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleChangeRole = async (targetUserId: string, newRole: 'admin' | 'moderator' | 'member') => {
    if (!isAdmin) return;

    setActionLoading(true);
    try {
      await updateMemberRole(conversation.id, targetUserId, newRole);
      await loadMembers();
      onMemberUpdate();
      setActionMenu(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async (targetUserId: string) => {
    if (!canManage) return;

    if (!confirm('Are you sure you want to kick this member?')) return;

    setActionLoading(true);
    try {
      await kickMember(conversation.id, targetUserId);
      await loadMembers();
      onMemberUpdate();
      setActionMenu(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to kick member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (targetUserId: string) => {
    if (!canManage) return;

    const reason = prompt('Enter ban reason (optional):');
    if (reason === null) return; // Cancelled

    setActionLoading(true);
    try {
      await banMember(conversation.id, targetUserId, reason || undefined);
      await loadMembers();
      onMemberUpdate();
      setActionMenu(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to ban member');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
            <Crown className="w-3 h-3" />
            Admin
          </div>
        );
      case 'moderator':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
            <Shield className="w-3 h-3" />
            Moderator
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700 text-gray-400 text-xs">
            <User className="w-3 h-3" />
            Member
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-blue-400" />
              Members ({members.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full bg-[#0f1419] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No members found
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1419] hover:bg-[#1a1f2e] transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={member.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                      alt={member.user.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                    {member.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1419] rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {member.user.displayName}
                      </span>
                      {member.userId === currentUserId && (
                        <span className="text-xs text-gray-400">(You)</span>
                      )}
                    </div>
                    {member.user.username && (
                      <div className="text-sm text-gray-400">@{member.user.username}</div>
                    )}
                  </div>

                  {/* Role Badge */}
                  {getRoleBadge(member.role)}

                  {/* Actions Menu */}
                  {canManage && member.userId !== currentUserId && (
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === member.id ? null : member.id)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {actionMenu === member.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f1419] border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleChangeRole(member.userId, 'admin')}
                                disabled={actionLoading || member.role === 'admin'}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                              >
                                <Crown className="w-4 h-4 text-yellow-400" />
                                Make Admin
                              </button>
                              <button
                                onClick={() => handleChangeRole(member.userId, 'moderator')}
                                disabled={actionLoading || member.role === 'moderator'}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                              >
                                <Shield className="w-4 h-4 text-purple-400" />
                                Make Moderator
                              </button>
                              {(member.role === 'admin' || member.role === 'moderator') && (
                                <button
                                  onClick={() => handleChangeRole(member.userId, 'member')}
                                  disabled={actionLoading}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Demote to Member
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handleKick(member.userId)}
                            disabled={actionLoading}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-orange-400 hover:bg-gray-700 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                            Kick Member
                          </button>
                          <button
                            onClick={() => handleBan(member.userId)}
                            disabled={actionLoading}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                            Ban Member
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

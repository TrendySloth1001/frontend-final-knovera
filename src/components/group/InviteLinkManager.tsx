'use client';

import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Copy, Check, Clock, Users, Trash2, Plus } from 'lucide-react';
import { ChatConversation, GroupInviteLink } from '@/types/chat';
import { createInviteLink, getInviteLinks, revokeInviteLink } from '@/lib/groupManagementApi';

interface InviteLinkManagerProps {
  conversation: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function InviteLinkManager({
  conversation,
  isOpen,
  onClose,
  currentUserId,
}: InviteLinkManagerProps) {
  const [links, setLinks] = useState<GroupInviteLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [maxUses, setMaxUses] = useState<number | undefined>(undefined);
  const [expiresInHours, setExpiresInHours] = useState<number | undefined>(24);

  const currentMember = conversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canManage = isAdmin || isModerator;

  useEffect(() => {
    if (isOpen && canManage) {
      loadLinks();
    }
  }, [isOpen, conversation.id]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await getInviteLinks(conversation.id);
      setLinks(data);
    } catch (error) {
      console.error('Failed to load invite links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const newLink = await createInviteLink(
        conversation.id,
        maxUses,
        expiresInHours
      );
      setLinks([newLink, ...links]);
      setMaxUses(undefined);
      setExpiresInHours(24);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create invite link');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this invite link?')) return;

    try {
      await revokeInviteLink(linkId);
      await loadLinks();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to revoke link');
    }
  };

  const handleCopyLink = (code: string, linkId: string) => {
    const inviteUrl = `${window.location.origin}/chat/join/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatExpiry = (expiresAt?: string | null) => {
    if (!expiresAt) return 'Never';
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d remaining`;
    return `${diffHours}h remaining`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Invite Links</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create New Link */}
          {canManage && (
            <div className="bg-[#0f1419] rounded-lg p-4 space-y-4 border border-gray-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Create New Invite Link
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Uses (optional)
                  </label>
                  <input
                    type="number"
                    value={maxUses || ''}
                    onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expires In (hours)
                  </label>
                  <select
                    value={expiresInHours || ''}
                    onChange={(e) => setExpiresInHours(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Never</option>
                    <option value="1">1 hour</option>
                    <option value="6">6 hours</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="168">7 days</option>
                    <option value="720">30 days</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateLink}
                disabled={creating}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Link
                  </>
                )}
              </button>
            </div>
          )}

          {/* Existing Links */}
          <div>
            <h3 className="font-semibold text-white mb-3">Active Links</h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No invite links yet
              </div>
            ) : (
              <div className="space-y-3">
                {links.filter(link => link.isActive).map((link) => (
                  <div
                    key={link.id}
                    className="bg-[#0f1419] rounded-lg p-4 border border-gray-700 space-y-3"
                  >
                    {/* Link Code */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#1a1f2e] rounded px-3 py-2 font-mono text-sm text-gray-300 truncate">
                        {`${window.location.origin}/chat/join/${link.code}`}
                      </div>
                      <button
                        onClick={() => handleCopyLink(link.code, link.id)}
                        className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRevoke(link.id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Link Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>
                          {link.usedCount}
                          {link.maxUses ? ` / ${link.maxUses}` : ''} uses
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatExpiry(link.expiresAt)}</span>
                      </div>
                      {link.creator && (
                        <div className="text-gray-400">
                          by {link.creator.displayName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Inactive Links */}
                {links.filter(link => !link.isActive).length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-400 mt-6 mb-3">Revoked Links</h3>
                    {links.filter(link => !link.isActive).map((link) => (
                      <div
                        key={link.id}
                        className="bg-[#0f1419] rounded-lg p-4 border border-gray-700 opacity-50 space-y-2"
                      >
                        <div className="font-mono text-sm text-gray-500 truncate">
                          {link.code}
                        </div>
                        <div className="text-xs text-gray-500">Revoked</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

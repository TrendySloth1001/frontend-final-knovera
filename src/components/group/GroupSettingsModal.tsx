'use client';

import { useState, useEffect } from 'react';
import { X, Info, Shield, UserPlus, Settings as SettingsIcon } from 'lucide-react';
import { ChatConversation, GroupSettings } from '@/types/chat';
import { updateGroupSettings } from '@/lib/groupManagementApi';

interface GroupSettingsModalProps {
  conversation: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (settings: GroupSettings) => void;
  currentUserId: string;
}

export default function GroupSettingsModal({
  conversation,
  isOpen,
  onClose,
  onUpdate,
  currentUserId,
}: GroupSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<GroupSettings>({
    name: conversation.name || '',
    description: conversation.description || '',
    rules: conversation.rules || '',
    adminOnlyMessaging: conversation.adminOnlyMessaging || false,
    approvalRequired: conversation.approvalRequired || false,
    allowMemberInvite: conversation.allowMemberInvite ?? true,
    allowMemberSettings: conversation.allowMemberSettings || false,
  });

  useEffect(() => {
    if (isOpen) {
      setSettings({
        name: conversation.name || '',
        description: conversation.description || '',
        rules: conversation.rules || '',
        adminOnlyMessaging: conversation.adminOnlyMessaging || false,
        approvalRequired: conversation.approvalRequired || false,
        allowMemberInvite: conversation.allowMemberInvite ?? true,
        allowMemberSettings: conversation.allowMemberSettings || false,
      });
      setError(null);
    }
  }, [isOpen, conversation]);

  // Check if current user is admin or creator
  const isCreator = conversation.createdBy === currentUserId;
  const currentMember = conversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const canEdit = isAdmin || isCreator;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateGroupSettings(conversation.id, settings);
      onUpdate(settings);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update group settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Group Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group name"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                placeholder="Describe what this group is about..."
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Rules
              </label>
              <textarea
                value={settings.rules}
                onChange={(e) => setSettings({ ...settings, rules: e.target.value })}
                className="w-full bg-[#0f1419] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Set group rules and guidelines..."
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Permissions & Controls
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.adminOnlyMessaging}
                  onChange={(e) => setSettings({ ...settings, adminOnlyMessaging: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0f1419] text-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
                <div>
                  <div className="text-white font-medium">Admin-only messaging</div>
                  <div className="text-sm text-gray-400">Only admins and moderators can send messages</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.approvalRequired}
                  onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0f1419] text-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
                <div>
                  <div className="text-white font-medium">Approval required to join</div>
                  <div className="text-sm text-gray-400">New members need admin approval</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.allowMemberInvite}
                  onChange={(e) => setSettings({ ...settings, allowMemberInvite: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0f1419] text-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
                <div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Allow members to invite
                  </div>
                  <div className="text-sm text-gray-400">Members can create invite links</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.allowMemberSettings}
                  onChange={(e) => setSettings({ ...settings, allowMemberSettings: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 bg-[#0f1419] text-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={!canEdit}
                />
                <div>
                  <div className="text-white font-medium">Allow members to change settings</div>
                  <div className="text-sm text-gray-400">Members can modify basic group info</div>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !canEdit}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

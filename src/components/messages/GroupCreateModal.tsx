'use client';

import { X, Users, Check } from 'lucide-react';
import { ChatUser } from '@/types/chat';

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  setGroupName: (name: string) => void;
  selectedMembers: string[];
  toggleMemberSelection: (userId: string) => void;
  availableUsers: ChatUser[];
  isLoadingMutualFollowers: boolean;
  isCreatingGroup: boolean;
  onCreateGroup: () => void;
}

export default function GroupCreateModal({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  selectedMembers,
  toggleMemberSelection,
  availableUsers,
  isLoadingMutualFollowers,
  isCreatingGroup,
  onCreateGroup,
}: GroupCreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold">Create Group</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-2">
              Select Members ({selectedMembers.length} selected)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {isLoadingMutualFollowers ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-neutral-500">Loading users...</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto mb-2 text-neutral-600" />
                  <p className="text-sm text-neutral-500">No users available</p>
                  <p className="text-xs text-neutral-600 mt-1">You need to follow other users to create groups</p>
                </div>
              ) : availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleMemberSelection(user.id)}
                  className={`w-full p-3 rounded-lg transition-colors text-left flex items-center gap-3 ${
                    selectedMembers.includes(user.id)
                      ? 'bg-white/10 border border-white/20'
                      : 'hover:bg-neutral-800 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">{user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.displayName || 'Unknown User'}</p>
                      {user.role && (
                        <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${
                          user.role === 'teacher' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.role === 'teacher' ? 'T' : 'S'}
                        </span>
                      )}
                    </div>
                    {user.username && <p className="text-xs text-neutral-500">@{user.username}</p>}
                  </div>
                  {selectedMembers.includes(user.id) && (
                    <Check size={18} className="text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-neutral-800 flex-shrink-0">
          <button
            onClick={onCreateGroup}
            disabled={isCreatingGroup || !groupName.trim() || selectedMembers.length === 0}
            className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isCreatingGroup ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

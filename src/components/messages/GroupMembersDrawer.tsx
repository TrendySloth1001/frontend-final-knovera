'use client';

import { X, Edit2, UserPlus, UserMinus, Search, Crown, MoreHorizontal } from 'lucide-react';
import { ChatConversation } from '@/types/chat';
import { useState } from 'react';

interface GroupMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupConversation: ChatConversation | null;
  currentUserId: string;
  onUpdateGroupName?: (conversationId: string, newName: string) => Promise<void>;
  onRemoveMember?: (conversationId: string, userId: string) => Promise<void>;
  onAddMembers?: (conversationId: string) => void;
}

export default function GroupMembersDrawer({
  isOpen,
  onClose,
  selectedGroupConversation,
  currentUserId,
  onUpdateGroupName,
  onRemoveMember,
  onAddMembers,
}: GroupMembersDrawerProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  if (!isOpen || !selectedGroupConversation) return null;

  const isCreator = selectedGroupConversation.createdBy === currentUserId;
  
  console.log('[GroupMembersDrawer] Permission check:', {
    currentUserId,
    createdBy: selectedGroupConversation.createdBy,
    isCreator,
    groupName: selectedGroupConversation.name,
    canEditName: isCreator && !!onUpdateGroupName,
    canAddMembers: isCreator && !!onAddMembers,
    canRemoveMembers: isCreator && !!onRemoveMember
  });

  const handleUpdateName = async () => {
    if (!editedName.trim() || !onUpdateGroupName) return;

    setIsUpdating(true);
    try {
      await onUpdateGroupName(selectedGroupConversation.id, editedName.trim());
      setIsEditingName(false);
      setEditedName('');
    } catch (error) {
      console.error('Failed to update group name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!onRemoveMember) return;

    const confirmed = window.confirm('Are you sure you want to remove this member?');
    if (!confirmed) return;

    try {
      await onRemoveMember(selectedGroupConversation.id, userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const filteredMembers = selectedGroupConversation.members.filter(member =>
    member.user.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (member.user.username && member.user.username.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-l border-zinc-800 z-50 flex flex-col shadow-2xl transition-transform duration-300">

        {/* Header Section */}
        <div className="px-6 py-5 border-b border-zinc-800/50 bg-[#0a0a0a]">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-zinc-400 font-medium text-sm uppercase tracking-widest">Group Info</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-4 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400">
              {selectedGroupConversation.name ? selectedGroupConversation.name.substring(0, 1).toUpperCase() : 'G'}
            </div>

            {isEditingName ? (
              <div className="flex gap-2 w-full max-w-xs animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder={selectedGroupConversation.name || 'Group name'}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setEditedName('');
                    }
                  }}
                />
                <button
                  onClick={handleUpdateName}
                  disabled={!editedName.trim() || isUpdating}
                  className="px-4 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group relative">
                <h1 className="text-xl font-bold text-white text-center">
                  {selectedGroupConversation.name || 'Unnamed Group'}
                </h1>
                {isCreator && onUpdateGroupName && (
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setEditedName(selectedGroupConversation.name || '');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded-lg transition-all absolute -right-8 top-1/2 -translate-y-1/2"
                  >
                    <Edit2 size={14} className="text-zinc-400" />
                  </button>
                )}
              </div>
            )}

            <p className="text-zinc-500 text-sm mt-2">
              {selectedGroupConversation.members.length} members • {selectedGroupConversation.members.filter(m => m.user.isOnline).length} online
            </p>
          </div>
        </div>

        {/* Members Logic */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-zinc-800/30">
            {/* Search Members */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search specific member..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {isCreator && onAddMembers && (
              <button
                onClick={() => {
                  onAddMembers(selectedGroupConversation.id);
                  onClose();
                }}
                className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-400 text-sm font-medium hover:bg-zinc-900/50 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Add New Member</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredMembers.map((member) => (
              <div
                key={member.userId}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900/40 transition-colors border border-transparent hover:border-zinc-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {member.user.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">
                          {member.user.displayName ? member.user.displayName.substring(0, 2).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    {member.user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-zinc-200 truncate">{member.user.displayName}</span>
                      {member.userId === selectedGroupConversation.createdBy && (
                        <Crown size={12} className="text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 truncate">
                      {member.user.username ? `@${member.user.username}` : 'No username'}
                    </span>
                  </div>
                </div>

                {isCreator && member.userId !== currentUserId && onRemoveMember ? (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Remove from group"
                  >
                    <UserMinus size={16} />
                  </button>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600">
                    <MoreHorizontal size={16} />
                  </div>
                )}
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-sm">
                No members found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { X, Users, Check, Search } from 'lucide-react';
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
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white">Create Group</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Start a conversation with multiple people</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto min-h-0">
            {/* Group Name Input */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Group Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users size={16} className="text-zinc-600" />
                </div>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Study Group"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>

            {/* Members Selection */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Select Members
                </label>
                {selectedMembers.length > 0 && (
                  <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.5 rounded-full">
                    {selectedMembers.length}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
                {isLoadingMutualFollowers ? (
                  <div className="text-center py-12">
                    <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs text-zinc-600">Loading contacts...</p>
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-zinc-600">
                      <Users size={20} />
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">No users found</p>
                    <p className="text-xs text-zinc-600 mt-1">You need followers to add members</p>
                  </div>
                ) : availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleMemberSelection(user.id)}
                    className={`w-full p-2.5 rounded-xl transition-all text-left flex items-center gap-3 border ${selectedMembers.includes(user.id)
                        ? 'bg-zinc-900 border-zinc-700'
                        : 'hover:bg-zinc-900/50 border-transparent hover:border-zinc-800/50'
                      }`}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-black border border-zinc-800 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">
                            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      {selectedMembers.includes(user.id) && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border-2 border-[#0a0a0a]">
                          <Check size={10} className="text-black stroke-[4]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm truncate ${selectedMembers.includes(user.id) ? 'text-white' : 'text-zinc-300'}`}>
                          {user.displayName || 'Unknown User'}
                        </p>
                      </div>
                      {user.username && <p className="text-xs text-zinc-600 truncate">@{user.username}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-zinc-800/50 flex-shrink-0 bg-[#0a0a0a] rounded-b-2xl">
            <button
              onClick={onCreateGroup}
              disabled={isCreatingGroup || !groupName.trim() || selectedMembers.length === 0}
              className="w-full py-3 bg-white text-black rounded-xl hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-white/5"
            >
              {isCreatingGroup ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Creating Group...
                </span>
              ) : (
                'Create Group'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

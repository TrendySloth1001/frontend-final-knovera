'use client';

import { X } from 'lucide-react';
import { ChatConversation } from '@/types/chat';

interface GroupMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupConversation: ChatConversation | null;
}

export default function GroupMembersDrawer({
  isOpen,
  onClose,
  selectedGroupConversation,
}: GroupMembersDrawerProps) {
  if (!isOpen || !selectedGroupConversation) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-black border-l border-neutral-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{selectedGroupConversation.name || 'Group'}</h2>
              <p className="text-sm text-gray-400">
                <span className="text-green-400 font-semibold">
                  {selectedGroupConversation.members.filter(m => m.user.isOnline).length} online
                </span>
                {' • '}
                {selectedGroupConversation.members.length} total members
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Members ({selectedGroupConversation.members.length})
          </h3>
          <div className="space-y-3">
            {selectedGroupConversation.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 p-3 hover:bg-neutral-900 rounded-lg transition-colors"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                    {member.user.avatarUrl ? (
                      <img src={member.user.avatarUrl} alt={member.user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">
                        {member.user.displayName ? member.user.displayName.substring(0, 2).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  {member.user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{member.user.displayName || 'Unknown User'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.user.username && (
                      <p className="text-xs text-gray-500">@{member.user.username}</p>
                    )}
                    {member.userId === selectedGroupConversation.createdBy && (
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded font-semibold">
                        Creator
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {member.user.isOnline ? (
                    <span className="text-xs text-green-400 font-semibold">Online</span>
                  ) : (
                    <span className="text-xs text-gray-600">Offline</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { Search, X } from 'lucide-react';
import { ChatUser } from '@/types/chat';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: ChatUser[];
  isStartingChat: boolean;
  onStartChat: (userId: string) => void;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  availableUsers,
  isStartingChat,
  onStartChat,
}: UserSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/10 rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Start New Chat</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onStartChat(user.id)}
                disabled={isStartingChat}
                className="w-full p-3 hover:bg-neutral-800 rounded-lg transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.displayName || 'Unknown User'}</p>
                  {user.username && <p className="text-xs text-neutral-500">@{user.username}</p>}
                </div>
                {user.isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

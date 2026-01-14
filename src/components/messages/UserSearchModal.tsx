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
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-md pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h3 className="text-zinc-100 font-bold ml-1">New Message</h3>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5">
            <div className="relative mb-5 group">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search people..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:bg-zinc-900 transition-all"
                autoFocus
              />
            </div>

            <div className="max-h-[340px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">Suggested</div>
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onStartChat(user.id)}
                  disabled={isStartingChat}
                  className="w-full p-2.5 hover:bg-zinc-900/50 rounded-xl transition-all text-left flex items-center gap-3 disabled:opacity-50 group border border-transparent hover:border-zinc-800/50"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300">
                          {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
                        </span>
                      )}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-200 group-hover:text-white truncate transition-colors">
                      {user.displayName || 'Unknown User'}
                    </p>
                    {user.username && (
                      <p className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate transition-colors">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {availableUsers.length === 0 && (
                <div className="text-center py-8 text-zinc-600">
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

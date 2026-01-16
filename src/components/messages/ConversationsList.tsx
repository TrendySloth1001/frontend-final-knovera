'use client';

import { MessageSquare, Plus, Users, X } from 'lucide-react';
import { ChatConversation, ChatUser } from '@/types/chat';
import ConversationItem from './ConversationItem';

interface ConversationsListProps {
  user: any;
  isConnected: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  filteredConversations: ChatConversation[];
  selectedConversation: ChatConversation | null;
  currentUserId: string;
  onSelectConversation: (conv: ChatConversation) => void;
  onShowUserSearch: () => void;
  onShowGroupCreate: () => void;
  onClose?: () => void;
  getUnreadCount: (conv: ChatConversation) => number;
  onGroupClick: (conv: ChatConversation) => void;
  onPinConversation: (conversationId: string, isPinned: boolean) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export default function ConversationsList({
  user,
  isConnected,
  searchQuery,
  setSearchQuery,
  isLoading,
  filteredConversations,
  selectedConversation,
  currentUserId,
  onSelectConversation,
  onShowUserSearch,
  onShowGroupCreate,
  onClose,
  getUnreadCount,
  onGroupClick,
  onPinConversation,
  onDeleteConversation,
}: ConversationsListProps) {
  return (
    <aside className={`flex-shrink-0 w-full md:w-[380px] border-r border-zinc-800 flex flex-col transition-all duration-300 ${selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
      {/* User Profile Header - Fixed Height */}
      <div className="p-3 md:p-5 flex items-center justify-between border-b border-zinc-800 bg-black sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.user?.avatarUrl ? (
              <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
            ) : (
              <MessageSquare size={18} className="text-neutral-600" />
            )}
          </div>
          {/* Username & Status */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <span className="font-medium text-sm text-white truncate leading-tight">
              {user?.user?.displayName || 'User'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-neutral-600'}`} />
              <span className="text-[11px] text-neutral-500 leading-none">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={onShowUserSearch}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors"
            title="New chat"
          >
            <Plus size={18} className="text-neutral-400" />
          </button>
          <button
            onClick={onShowGroupCreate}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors"
            title="Create group"
          >
            <Users size={18} className="text-neutral-400" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors md:hidden"
              title="Close"
            >
              <X size={18} className="text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 md:px-4 md:py-3">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-3 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-4 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs uppercase tracking-widest">Loading...</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-4 text-center">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-sm mb-1">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
            <button
              onClick={onShowUserSearch}
              className="mt-4 px-4 py-2 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all text-sm font-medium"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {/* Pinned Conversations */}
            {filteredConversations.filter(c => c.isPinned).length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pinned</div>
                {filteredConversations.filter(c => c.isPinned).map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    currentUserId={currentUserId}
                    isSelected={selectedConversation?.id === conv.id}
                    onClick={() => onSelectConversation(conv)}
                    unreadCount={getUnreadCount(conv)}
                    onGroupClick={onGroupClick}
                    onPin={() => onPinConversation(conv.id, true)}
                    onDelete={() => onDeleteConversation(conv.id)}
                  />
                ))}
              </>
            )}

            {/* Recent Messages */}
            {filteredConversations.filter(c => !c.isPinned).length > 0 && (
              <>
                <div className="px-3 py-2 mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {filteredConversations.filter(c => c.isPinned).length > 0 ? 'Recent Messages' : 'Messages'}
                </div>
                {filteredConversations.filter(c => !c.isPinned).map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    currentUserId={currentUserId}
                    isSelected={selectedConversation?.id === conv.id}
                    onClick={() => onSelectConversation(conv)}
                    unreadCount={getUnreadCount(conv)}
                    onGroupClick={onGroupClick}
                    onPin={() => onPinConversation(conv.id, false)}
                    onDelete={() => onDeleteConversation(conv.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

'use client';

import { Users, MoreVertical, UserCircle, Trash2 } from 'lucide-react';
import { ChatConversation } from '@/types/chat';

interface ChatHeaderProps {
  selectedConversation: ChatConversation;
  currentUserId: string;
  isConnected: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onBack: () => void;
  onProfileClick: () => void;
  onGroupMembersClick: () => void;
  onDeleteClick: () => void;
  getConversationName: (conv: ChatConversation) => string;
  getConversationAvatar: (conv: ChatConversation) => string | null;
}

export default function ChatHeader({
  selectedConversation,
  currentUserId,
  isConnected,
  showMenu,
  setShowMenu,
  onBack,
  onProfileClick,
  onGroupMembersClick,
  onDeleteClick,
  getConversationName,
  getConversationAvatar,
}: ChatHeaderProps) {
  return (
    <div className="h-16 px-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
      {/* Mobile Back Button */}
      <button
        onClick={onBack}
        className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors mr-2 flex-shrink-0"
        title="Back to conversations"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* Left: Avatar + User Info */}
      <button 
        onClick={() => {
          if (selectedConversation.isGroup) {
            onGroupMembersClick();
          } else {
            onProfileClick();
          }
        }}
        className="flex items-center gap-3 min-w-0 flex-1 hover:bg-neutral-900/50 rounded-lg -ml-2 pl-2 py-1 transition-colors cursor-pointer"
      >
        {/* Avatar */}
        {selectedConversation.isGroup ? (
          <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-neutral-600" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {getConversationAvatar(selectedConversation) ? (
              <img
                src={getConversationAvatar(selectedConversation)!}
                alt={getConversationName(selectedConversation)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-neutral-500">
                {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        )}
        {/* Username & Status */}
        <div className="flex flex-col justify-center min-w-0 flex-1 text-left">
          <h3 className="font-medium text-sm text-white truncate leading-tight">
            {getConversationName(selectedConversation)}
          </h3>
          {!selectedConversation.isGroup && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                selectedConversation.members.find((m) => m.userId !== currentUserId)?.user.isOnline
                  ? 'bg-green-500'
                  : 'bg-neutral-600'
              }`} />
              <span className="text-[11px] text-neutral-500 leading-none">
                {selectedConversation.members.find((m) => m.userId !== currentUserId)?.user.isOnline
                  ? 'Online'
                  : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </button>
      {/* Right: Connection Status + Actions */}
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <span className={`text-[11px] leading-none ${
            isConnected ? 'text-neutral-500' : 'text-yellow-600'
          }`}>
            {isConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>
        {/* Menu Button */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical size={18} className="text-neutral-400" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-20 overflow-hidden">
                {!selectedConversation.isGroup && (
                  <button
                    onClick={() => {
                      onProfileClick();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-800 transition-colors flex items-center gap-3"
                  >
                    <UserCircle size={16} className="text-neutral-400" />
                    <span>View Profile</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDeleteClick();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-red-900/20 transition-colors flex items-center gap-3 text-red-500"
                >
                  <Trash2 size={16} />
                  <span>Delete Conversation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

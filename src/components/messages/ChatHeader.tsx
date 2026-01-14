'use client';

import { Users, MoreVertical, UserCircle, Trash2, ArrowLeft, Info } from 'lucide-react';
import { ChatConversation } from '@/types/chat';
import ImageStack from './ImageStack';

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
  const isCreator = selectedConversation.createdBy === currentUserId;
  const showDeleteButton = !selectedConversation.isGroup || isCreator;

  console.log('[ChatHeader] Debug:', {
    isGroup: selectedConversation.isGroup,
    isCreator,
    createdBy: selectedConversation.createdBy,
    currentUserId,
    showDeleteButton
  });

  return (
    <header className="h-[72px] px-6 flex items-center justify-between border-b border-zinc-800 bg-black z-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            if (selectedConversation.isGroup) {
              onGroupMembersClick();
            } else {
              onProfileClick();
            }
          }}
        >
          <img
            src={getConversationAvatar(selectedConversation) || 'https://via.placeholder.com/40'}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-bold text-sm text-white group-hover:underline">{getConversationName(selectedConversation)}</h2>
            <div className="text-[11px] text-zinc-500 font-medium h-5 flex items-center">
              {!selectedConversation.isGroup && selectedConversation.members.find((m) => m.userId !== currentUserId)?.user.isOnline ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active now
                </div>
              ) : !selectedConversation.isGroup ? (
                'Offline'
              ) : (
                <ImageStack
                  images={selectedConversation.members.map(m => m.user.avatarUrl || `https://ui-avatars.com/api/?name=${m.user.displayName}`)}
                  size={20}
                  limit={4}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (selectedConversation.isGroup) {
              onGroupMembersClick();
            } else {
              onProfileClick();
            }
          }}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Info size={20} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20 overflow-hidden">
                {!selectedConversation.isGroup && (
                  <button
                    onClick={() => {
                      onProfileClick();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <UserCircle size={16} className="text-zinc-400" />
                    <span>View Profile</span>
                  </button>
                )}
                {showDeleteButton && (
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
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

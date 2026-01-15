'use client';

import { useState } from 'react';
import { Users, MoreVertical, UserCircle, Trash2, ArrowLeft, Info, Settings, Link as LinkIcon, UserPlus, Pin, Megaphone, Share2 } from 'lucide-react';
import { ChatConversation } from '@/types/chat';
import ImageStack from './ImageStack';
import ShareGroupModal from './ShareGroupModal';

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
  authToken: string; // Add auth token for share modal
  // Group Management Actions
  onGroupSettings?: () => void;
  onMemberList?: () => void;
  onInviteLinks?: () => void;
  onJoinRequests?: () => void;
  onPinnedMessages?: () => void;
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
  authToken,
  onGroupSettings,
  onMemberList,
  onInviteLinks,
  onJoinRequests,
  onPinnedMessages,
}: ChatHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const isCreator = selectedConversation.createdBy === currentUserId;
  const showDeleteButton = !selectedConversation.isGroup || isCreator;
  
  // Check if current user is admin or moderator
  const currentMember = selectedConversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canManage = isAdmin || isModerator;

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
              <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-20 overflow-hidden">
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
                
                {/* Group Management Options */}
                {selectedConversation.isGroup && (
                  <>
                    <button
                      onClick={() => {
                        setShowShareModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                    >
                      <Share2 size={16} className="text-green-400" />
                      <span>Share Group</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onMemberList?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                    >
                      <Users size={16} className="text-zinc-400" />
                      <span>View Members</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onPinnedMessages?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                    >
                      <Pin size={16} className="text-blue-400" />
                      <span>Pinned Messages</span>
                    </button>
                    
                    {canManage && (
                      <>
                        <div className="border-t border-zinc-800 my-1" />
                        
                        <button
                          onClick={() => {
                            onGroupSettings?.();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                        >
                          <Settings size={16} className="text-purple-400" />
                          <span>Group Settings</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            onInviteLinks?.();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                        >
                          <LinkIcon size={16} className="text-green-400" />
                          <span>Invite Links</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            onJoinRequests?.();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-3"
                        >
                          <UserPlus size={16} className="text-yellow-400" />
                          <span>Join Requests</span>
                        </button>
                      </>
                    )}
                    
                    <div className="border-t border-zinc-800 my-1" />
                  </>
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

      {/* Share Group Modal */}
      {selectedConversation.isGroup && (
        <ShareGroupModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          groupToShare={selectedConversation}
          currentUserId={currentUserId}
          authToken={authToken}
        />
      )}
    </header>
  );
}

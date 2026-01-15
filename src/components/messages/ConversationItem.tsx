'use client';

import { Users, Pin } from 'lucide-react';
import { ChatConversation } from '@/types/chat';
import { mentionToDisplayText } from '@/utils/mentionParser';

// Format time helper function
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleDateString();
}

interface ConversationItemProps {
  conv: ChatConversation;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
  unreadCount: number;
  onGroupClick?: (conv: ChatConversation) => void;
}

export default function ConversationItem({
  conv,
  currentUserId,
  isSelected,
  onClick,
  unreadCount,
  onGroupClick
}: ConversationItemProps) {
  const otherUser = !conv.isGroup
    ? conv.members.find((m) => m.userId !== currentUserId)
    : null;
  const isOnline = otherUser?.user.isOnline;
  const conversationName = conv.name || (conv.isGroup
    ? conv.members.map((m) => m.user.displayName).join(', ')
    : otherUser?.user.displayName || 'Unknown User');

  // Determine last message text with media support
  const getLastMessageText = () => {
    if (!conv.lastMessage) return 'No messages yet';

    const prefix = conv.lastMessage.userId === currentUserId ? 'You: ' : '';

    // Check for multiple media
    if (conv.lastMessage.mediaUrls && conv.lastMessage.mediaUrls.length > 1) {
      return prefix + `📷 ${conv.lastMessage.mediaUrls.length} Photos`;
    }

    // Check for single media
    if (conv.lastMessage.mediaUrl || (conv.lastMessage.mediaUrls && conv.lastMessage.mediaUrls.length === 1)) {
      return prefix + '📷 Photo';
    }

    return prefix + mentionToDisplayText(conv.lastMessage.content || 'Media');
  };

  const lastMessageText = getLastMessageText();
  const lastMessageTime = conv.lastMessage
    ? formatTime(conv.lastMessage.createdAt)
    : '';

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative border
        ${isSelected ? 'border-zinc-700 bg-zinc-900/30' : 'border-transparent hover:border-zinc-800'}
      `}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-12 h-12 rounded-full flex items-center justify-center overflow-hidden
            ${conv.isGroup ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          `}
          onClick={(e) => {
            if (conv.isGroup && onGroupClick) {
              e.stopPropagation();
              onGroupClick(conv);
            }
          }}
        >
          {conv.isGroup ? (
            conv.avatarUrl ? (
              <img
                src={conv.avatarUrl}
                alt={conversationName}
                className="w-full h-full object-cover grayscale-[0.2]"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Users size={22} className="text-zinc-400" />
              </div>
            )
          ) : (
            otherUser?.user.avatarUrl ? (
              <img
                src={otherUser.user.avatarUrl}
                alt={conversationName}
                className="w-full h-full object-cover grayscale-[0.2]"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <span className="text-sm font-semibold text-zinc-400">
                  {conversationName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )
          )}
        </div>
        {!conv.isGroup && isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className={`font-semibold truncate text-sm ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
            {conversationName}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium">{lastMessageTime}</span>
        </div>
        <p className="text-xs text-zinc-500 truncate leading-relaxed">
          {lastMessageText}
        </p>
      </div>
      {unreadCount > 0 && (
        <div className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {unreadCount}
        </div>
      )}
    </button>
  );
}

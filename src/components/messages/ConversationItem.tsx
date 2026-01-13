'use client';

import { Users, Pin } from 'lucide-react';
import { ChatConversation } from '@/types/chat';

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
  const lastMessageText = conv.lastMessage 
    ? (conv.lastMessage.userId === currentUserId ? 'You: ' : '') + (conv.lastMessage.content || 'Media')
    : 'No messages yet';
  const lastMessageTime = conv.lastMessage 
    ? formatTime(conv.lastMessage.createdAt)
    : '';

  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
        ${isSelected ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'}
      `}
    >
      <div className="relative">
        <div 
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center border
            ${isSelected ? 'bg-black/10 border-black/5' : 'bg-zinc-900 border-white/5'}
            ${conv.isGroup ? 'cursor-pointer hover:bg-zinc-800 transition-colors' : ''}
          `}
          onClick={(e) => {
            if (conv.isGroup && onGroupClick) {
              e.stopPropagation();
              onGroupClick(conv);
            }
          }}
        >
          {conv.isGroup ? (
            <Users size={22} className={isSelected ? 'text-black' : 'text-zinc-400'} />
          ) : (
            otherUser?.user.avatarUrl ? (
              <img 
                src={otherUser.user.avatarUrl} 
                alt={conversationName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className={`text-sm font-semibold ${isSelected ? 'text-black' : 'text-zinc-400'}`}>
                {conversationName.substring(0, 2).toUpperCase()}
              </span>
            )
          )}
        </div>
        {!conv.isGroup && isOnline && (
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 bg-emerald-500 ${isSelected ? 'border-white' : 'border-black'}`} />
        )}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`text-sm truncate ${
            isSelected 
              ? 'text-black font-bold' 
              : unreadCount > 0 
                ? 'text-white font-extrabold' 
                : 'text-zinc-100 font-bold'
          }`}>
            {conversationName}
          </span>
          {lastMessageTime && (
            <span className={`text-[10px] font-medium flex-shrink-0 ml-2 ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
              {lastMessageTime}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate ${
            isSelected 
              ? 'text-black/80 font-medium' 
              : unreadCount > 0 
                ? 'text-zinc-300 font-semibold' 
                : 'text-zinc-500 font-medium'
          }`}>
            {lastMessageText}
          </p>
          <div className="flex items-center gap-2 ml-2">
            {unreadCount > 0 && (
              <div className="min-w-[20px] h-5 bg-blue-500 rounded-full flex items-center justify-center px-1.5 text-[10px] font-bold text-white flex-shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
            {conv.isPinned && !isSelected && (
              <Pin size={12} className="text-zinc-700" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

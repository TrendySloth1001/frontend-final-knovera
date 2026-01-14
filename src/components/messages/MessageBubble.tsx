'use client';

import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
  isGroup?: boolean;
  onAvatarClick?: (userId: string) => void;
}

export default function MessageBubble({ msg, isOwn, currentUserId, isGroup, onAvatarClick }: MessageBubbleProps) {
  // Check if message has been seen by any other user (not the sender)
  const isSeen = msg.seenBy && msg.seenBy.length > 0 && msg.seenBy.some((s) => s.userId !== msg.userId);
  // Count how many users have seen it (excluding sender)
  const seenCount = msg.seenBy?.filter((s) => s.userId !== msg.userId).length || 0;

  return (
    <div
      key={msg.id}
      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {/* Group Avatar */}
      {!isOwn && isGroup && (
        <button
          onClick={() => onAvatarClick?.(msg.userId)}
          className="flex-shrink-0 self-end mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden hover:border-zinc-500 transition-colors">
            {msg.user?.avatarUrl ? (
              <img src={msg.user.avatarUrl} alt={msg.user.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-zinc-500">
                {msg.user?.displayName ? msg.user.displayName.substring(0, 2).toUpperCase() : 'U'}
              </span>
            )}
          </div>
        </button>
      )}

      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name in Group */}
        {!isOwn && isGroup && (
          <span className="text-[10px] text-zinc-500 mb-1 ml-1 cursor-pointer hover:underline" onClick={() => onAvatarClick?.(msg.userId)}>
            {msg.user?.displayName || 'Unknown User'}
          </span>
        )}

        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isOwn
              ? 'bg-black text-white rounded-tr-none border border-zinc-700'
              : 'bg-black text-white rounded-tl-none border border-zinc-800'}
          `}
        >
          {msg.mediaUrl && (
            <div className="mb-2">
              {msg.mediaType?.startsWith('image/') ? (
                <img
                  src={msg.mediaUrl}
                  alt="Media"
                  className="max-w-full rounded-lg"
                />
              ) : (
                <a
                  href={msg.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View media
                </a>
              )}
            </div>
          )}
          {msg.content}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[10px] text-zinc-500 font-medium">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwn && (
            msg.seenBy && msg.seenBy.length > 0 && msg.seenBy.some((s) => s.userId !== msg.userId) ? (
              <CheckCheck size={12} className="text-blue-400" />
            ) : (
              <Check size={12} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

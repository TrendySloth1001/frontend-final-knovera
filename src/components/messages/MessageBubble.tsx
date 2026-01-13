'use client';

import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
}

export default function MessageBubble({ msg, isOwn, currentUserId }: MessageBubbleProps) {
  // Check if message has been seen by any other user (not the sender)
  const isSeen = msg.seenBy && msg.seenBy.length > 0 && msg.seenBy.some((s) => s.userId !== msg.userId);
  // Count how many users have seen it (excluding sender)
  const seenCount = msg.seenBy?.filter((s) => s.userId !== msg.userId).length || 0;

  return (
    <div
      key={msg.id}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {msg.user?.avatarUrl ? (
              <img
                src={msg.user.avatarUrl}
                alt={msg.user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-neutral-500">
                {msg.user?.displayName.substring(0, 2).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && (
            <span className="text-xs text-neutral-500 mb-1 px-3">
              {msg.user?.displayName || msg.username || 'Unknown'}
            </span>
          )}
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isOwn
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-900 text-white'
            }`}
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
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
          </div>
          <div className="flex items-center gap-1 mt-1 px-3">
            <span className="text-[11px] text-neutral-600">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isOwn && (
              <span className="text-xs" title={isSeen ? `Seen by ${seenCount} user(s)` : 'Delivered'}>
                {isSeen ? (
                  <CheckCheck size={12} className="text-blue-500" />
                ) : (
                  <Check size={12} className="text-neutral-600" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Check, CheckCheck, Reply, FileText, Video, Music, Image as ImageIcon } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

interface MessageBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
  isGroup?: boolean;
  onAvatarClick?: (userId: string) => void;
  onReplyToMessage?: (message: ChatMessage) => void;
  messageRef?: (el: HTMLDivElement | null) => void;
  isHighlighted?: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

export default function MessageBubble({ msg, isOwn, currentUserId, isGroup, onAvatarClick, onReplyToMessage, messageRef, isHighlighted, onScrollToMessage }: MessageBubbleProps) {
  // Check if message has been seen by any other user (not the sender)
  const isSeen = msg.seenBy && msg.seenBy.length > 0 && msg.seenBy.some((s) => s.userId !== msg.userId);
  // Count how many users have seen it (excluding sender)
  const seenCount = msg.seenBy?.filter((s) => s.userId !== msg.userId).length || 0;

  const handleReplyClick = () => {
    if (msg.replyToId && onScrollToMessage) {
      onScrollToMessage(msg.replyToId);
    }
  };

  return (
    <div
      ref={messageRef}
      key={msg.id}
      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'} group transition-all duration-300 ${isHighlighted ? 'scale-105' : ''}`}
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
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all duration-300
            ${isOwn
              ? 'bg-black text-white rounded-tr-none border border-zinc-700'
              : 'bg-black text-white rounded-tl-none border border-zinc-800'}
            ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''}
          `}
        >
          {/* Reply Reference */}
          {msg.replyToMessage && (
            <div
              onClick={handleReplyClick}
              className="mb-3 pb-2 border-l-3 border-blue-500 pl-3 bg-zinc-900/70 rounded-r p-2 cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Reply size={12} className="text-blue-400" />
                <span className="font-semibold text-blue-400 text-xs">
                  {msg.replyToMessage.user.displayName}
                </span>
              </div>
              <div className="text-zinc-400 text-xs line-clamp-2 flex items-center gap-1">
                {msg.replyToMessage.content || (
                  <span className="flex items-center gap-1">
                    {(() => {
                      const mediaType = (msg.replyToMessage as any)?.mediaType;
                      if (mediaType?.startsWith('image/')) return <><ImageIcon size={12} /> Image</>;
                      if (mediaType?.startsWith('video/')) return <><Video size={12} /> Video</>;
                      if (mediaType?.startsWith('audio/')) return <><Music size={12} /> Audio</>;
                      if (mediaType?.startsWith('application/')) return <><FileText size={12} /> Document</>;
                      return 'Media';
                    })()}
                  </span>
                )}
              </div>
            </div>
          )}

          {msg.mediaUrl && (() => {
            // Validate URL before rendering
            try {
              const url = new URL(msg.mediaUrl, window.location.origin);
              const isValidUrl = url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'blob:';

              if (!isValidUrl) {
                console.error('[MessageBubble] Invalid URL protocol:', msg.mediaUrl);
                return null;
              }
            } catch (error) {
              console.error('[MessageBubble] Invalid media URL:', msg.mediaUrl, error);
              return null;
            }

            return (
              <div className="mb-2">
                {msg.mediaType === 'image' || msg.mediaType?.startsWith('image/') ? (
                  <img
                    src={msg.mediaUrl}
                    alt="Media"
                    className="max-w-full max-h-96 rounded-lg object-contain"
                    onError={(e) => {
                      console.error('[MessageBubble] Image load failed:', msg.mediaUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : msg.mediaType === 'video' || msg.mediaType?.startsWith('video/') ? (
                  <VideoPlayer
                    src={msg.mediaUrl}
                    className="max-w-full max-h-96 rounded-lg"
                  />
                ) : msg.mediaType === 'audio' || msg.mediaType?.startsWith('audio/') ? (
                  <AudioPlayer
                    src={msg.mediaUrl}
                  />
                ) : msg.mediaType?.startsWith('application/') || msg.mediaType?.includes('document') ? (
                  <a
                    href={msg.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors border border-zinc-800"
                  >
                    <FileText size={20} className="text-blue-400" />
                    <span className="text-sm text-zinc-300">View Document</span>
                  </a>
                ) : (
                  <a
                    href={msg.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    📎 View media
                  </a>
                )}
              </div>
            );
          })()}
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

      {/* Reply Button */}
      {onReplyToMessage && (
        <button
          onClick={() => onReplyToMessage(msg)}
          className="opacity-0 group-hover:opacity-100 transition-opacity self-end mb-1 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
          title="Reply to message"
        >
          <Reply size={14} />
        </button>
      )}
    </div>
  );
}

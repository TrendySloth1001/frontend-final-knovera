import { FileText, Reply, Trash2, Check, CheckCheck, FileIcon, Video, Music, Image as ImageIcon, Star } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import DocumentViewer from './DocumentViewer';
import MediaGrid from './MediaGrid';
import { parseTextWithLinks } from '@/utils/linkify';
import MessageContextMenu from './MessageContextMenu';
import ReactionPicker from './ReactionPicker';

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
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string, forEveryone: boolean) => void;
  onForwardMessage?: (messageId: string) => void;
  onStarMessage?: (messageId: string) => void;
  onUnstarMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onViewHistory?: (messageId: string) => void;
}

// Component to render text with clickable links
const LinkifiedText = ({ text }: { text: string }) => {
  const parts = parseTextWithLinks(text);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'link' || part.type === 'email') {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

export default function MessageBubble({ msg, isOwn, currentUserId, isGroup, onAvatarClick, onReplyToMessage, messageRef, isHighlighted, onScrollToMessage, onEditMessage, onDeleteMessage, onForwardMessage, onStarMessage, onUnstarMessage, onAddReaction, onRemoveReaction, onViewHistory }: MessageBubbleProps) {
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

          {/* Media Content - Multiple or Single */}
          {msg.mediaUrls && msg.mediaUrls.length > 0 ? (
            <MediaGrid mediaUrls={msg.mediaUrls} mediaTypes={msg.mediaTypes || []} />
          ) : msg.mediaUrl && (() => {
            // Single media (backward compatibility)
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
                  <DocumentViewer
                    src={msg.mediaUrl}
                  />
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
          {msg.content && (
            <div className="whitespace-pre-wrap break-words">
              <LinkifiedText text={msg.content} />
            </div>
          )}
          
          {/* Reactions Display */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className="mt-2 -mb-1">
              <ReactionPicker
                messageId={msg.id}
                reactions={msg.reactions}
                onAddReaction={(emoji) => onAddReaction?.(msg.id, emoji)}
                onRemoveReaction={(emoji) => onRemoveReaction?.(msg.id, emoji)}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[10px] text-zinc-500 font-medium">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {msg.isEdited && <span className="text-zinc-600">(edited)</span>}
          {msg.isStarred && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
          {isOwn && (
            msg.seenBy && msg.seenBy.length > 0 && msg.seenBy.some((s) => s.userId !== msg.userId) ? (
              <CheckCheck size={12} className="text-blue-400" />
            ) : (
              <Check size={12} />
            )
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 self-end mb-1">
        {/* Reaction Picker (only show empty picker when no reactions) */}
        {(!msg.reactions || msg.reactions.length === 0) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ReactionPicker
              messageId={msg.id}
              reactions={[]}
              onAddReaction={(emoji) => onAddReaction?.(msg.id, emoji)}
              onRemoveReaction={(emoji) => onRemoveReaction?.(msg.id, emoji)}
            />
          </div>
        )}
        
        {/* Reply Button */}
        {onReplyToMessage && (
          <button
            onClick={() => onReplyToMessage(msg)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            title="Reply to message"
          >
            <Reply size={14} />
          </button>
        )}
        
        {/* Context Menu with its own button */}
        <MessageContextMenu
          message={msg}
          currentUserId={currentUserId}
          onReply={(message) => {
            onReplyToMessage?.(message);
          }}
          onEdit={(message) => {
            const newContent = prompt('Edit message:', message.content || '');
            if (newContent !== null && newContent !== message.content) {
              onEditMessage?.(message.id, newContent);
            }
          }}
          onDelete={(message, forEveryone) => {
            onDeleteMessage?.(message.id, forEveryone);
          }}
          onForward={(message) => {
            onForwardMessage?.(message.id);
          }}
          onStar={(message) => {
            if (message.isStarred) {
              onUnstarMessage?.(message.id);
            } else {
              onStarMessage?.(message.id);
            }
          }}
          onCopy={(content) => {
            navigator.clipboard.writeText(content);
          }}
          onViewHistory={(message) => {
            onViewHistory?.(message.id);
          }}
        />
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { FileText, Reply, Trash2, Check, CheckCheck, FileIcon, Video, Music, Image as ImageIcon, Star, Pin, Megaphone } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import DocumentViewer from './DocumentViewer';
import MediaGrid from './MediaGrid';
import { parseTextWithLinks } from '@/utils/linkify';
import { parseGroupShareLinks } from '@/utils/groupShareLink';
import MessageContextMenu from './MessageContextMenu';
import ReactionPicker from './ReactionPicker';
import Mention from './Mention';
import { splitTextWithMentions, mentionToDisplayText } from '@/utils/mentionParser';
import PollMessage from './PollMessage';
import GroupSharePreview from './GroupSharePreview';

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
  onPinMessage?: (messageId: string) => void;
  onVote?: (pollId: string, optionIndex: number) => void;
  onGroupPreview?: (groupId: string) => void;
  onShowSeenBy?: (messageId: string, seenBy: any[]) => void;
}

// Component to render text with clickable links and mentions
const LinkifiedText = ({ text, onMentionClick }: { text: string; onMentionClick?: (userId: string) => void }) => {
  // First, split by mentions
  const mentionSegments = splitTextWithMentions(text);

  return (
    <>
      {mentionSegments.map((segment, index) => {
        if (segment.type === 'mention') {
          return (
            <Mention
              key={index}
              userId={segment.userId!}
              displayName={segment.displayName!}
              onClick={onMentionClick}
            />
          );
        }

        // For text segments, parse for links
        const parts = parseTextWithLinks(segment.content);
        return (
          <span key={index}>
            {parts.map((part, partIndex) => {
              if (part.type === 'link' || part.type === 'email') {
                return (
                  <a
                    key={partIndex}
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
              return <span key={partIndex}>{part.content}</span>;
            })}
          </span>
        );
      })}
    </>
  );
};

export default function MessageBubble({ msg, isOwn, currentUserId, isGroup, onAvatarClick, onReplyToMessage, messageRef, isHighlighted, onScrollToMessage, onEditMessage, onDeleteMessage, onForwardMessage, onStarMessage, onUnstarMessage, onAddReaction, onRemoveReaction, onViewHistory, onPinMessage, onVote, onGroupPreview, onShowSeenBy }: MessageBubbleProps) {
  const uniqueSeenBy = useMemo(() => {
    if (!msg.seenBy) return [];
    // Filter out sender first, then deduplicate
    return msg.seenBy
      .filter(s => s.userId !== msg.userId)
      .filter((seen, index, self) =>
        index === self.findIndex((t) => t.userId === seen.userId)
      );
  }, [msg.seenBy, msg.userId]);

  // Check if message has been seen by any other user (not the sender)
  const isSeen = uniqueSeenBy.length > 0;
  // Count how many users have seen it (excluding sender)
  const seenCount = uniqueSeenBy.length;

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
          className="flex-shrink-0 self-end mb-1 order-1"
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

      <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'} order-2`}>
        {/* Sender Name in Group */}
        {!isOwn && isGroup && (
          <span className="text-[10px] text-zinc-500 mb-1 ml-1 cursor-pointer hover:underline" onClick={() => onAvatarClick?.(msg.userId)}>
            {msg.user?.displayName || 'Unknown User'}
          </span>
        )}

        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all duration-300
            ${msg.isAnnouncement
              ? 'bg-black border border-zinc-500 text-white w-full'
              : isOwn
                ? 'bg-black text-white rounded-tr-none border border-zinc-700'
                : 'bg-black text-white rounded-tl-none border border-zinc-800'}
            ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''}
          `}
        >
          {msg.isAnnouncement && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700">
              <div className="p-1 rounded bg-zinc-800 text-zinc-300">
                <Megaphone size={14} />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Announcement</span>
            </div>
          )}

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
                {mentionToDisplayText(msg.replyToMessage.content) || (
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
          {msg.poll ? (
            <div className="mt-1">
              <PollMessage
                message={msg}
                currentUserId={currentUserId}
                onVote={(pollId, optionIndex) => onVote?.(pollId, optionIndex)}
              />
            </div>
          ) : (
            msg.content && (() => {
              // Parse group share links from message content
              const { text, groupLinks } = parseGroupShareLinks(msg.content);

              return (
                <div className="space-y-2">
                  {text && (
                    <div className="whitespace-pre-wrap break-words">
                      <LinkifiedText text={text} onMentionClick={onAvatarClick} />
                    </div>
                  )}

                  {/* Render group share previews */}
                  {groupLinks.map((link, index) => (
                    <GroupSharePreview
                      key={index}
                      groupId={link.groupId}
                      onOpen={onGroupPreview}
                    />
                  ))}
                </div>
              );
            })()
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

          {/* Seen By Facepile for Announcements */}
          {msg.isAnnouncement && uniqueSeenBy.length > 0 && (
            <div
              className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onShowSeenBy?.(msg.id, uniqueSeenBy);
              }}
            >
              <div className="flex items-center -space-x-2 overflow-hidden pl-1">
                {uniqueSeenBy
                  .slice(0, 4)
                  .map((seen) => (
                    <div
                      key={seen.userId}
                      className="w-5 h-5 rounded-full ring-2 ring-black bg-zinc-800 flex items-center justify-center overflow-hidden"
                      title={`${seen.displayName || seen.username || 'User'} saw at ${new Date(seen.seenAt).toLocaleTimeString()}`}
                    >
                      <img
                        src={seen.avatarUrl || `https://ui-avatars.com/api/?name=${seen.displayName || seen.username || 'U'}&background=random`}
                        alt={seen.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                {(uniqueSeenBy.length > 4) && (
                  <div className="w-5 h-5 rounded-full ring-2 ring-black bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                    +{uniqueSeenBy.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-medium ml-2">
                Seen by {uniqueSeenBy.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[10px] text-zinc-500 font-medium">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {msg.isAnnouncement && <span className="text-amber-500/50">• Announcement</span>}
          {msg.isEdited && <span className="text-zinc-600">(edited)</span>}
          {msg.isPinned && (
            <div className="flex items-center gap-1 text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded-md">
              <Pin size={10} className="fill-zinc-400" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Pinned</span>
            </div>
          )}
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
      <div className={`flex gap-1 self-center mb-1 ${isOwn ? 'order-1' : 'order-3'} opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity`}>
        {/* Reaction Picker (only show empty picker when no reactions) */}
        {(!msg.reactions || msg.reactions.length === 0) && (
          <div>
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
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            title="Reply to message"
          >
            <Reply size={14} />
          </button>
        )}

        {/* Context Menu with its own button */}
        <MessageContextMenu
          message={msg}
          currentUserId={currentUserId}
          isGroup={isGroup}
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
          onPin={(message) => {
            onPinMessage?.(message.id);
          }}
        />
      </div>
    </div>
  );
}

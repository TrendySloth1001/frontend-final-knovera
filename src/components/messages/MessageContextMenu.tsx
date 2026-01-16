import { ChatMessage } from '@/types/chat';
import { 
  Copy, 
  Reply, 
  Edit, 
  Trash2, 
  Forward, 
  Star, 
  MoreVertical,
  Clock,
  Pin
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MessageContextMenuProps {
  message: ChatMessage;
  currentUserId: string;
  isGroup?: boolean;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage, deleteForEveryone: boolean) => void;
  onForward: (message: ChatMessage) => void;
  onStar: (message: ChatMessage) => void;
  onCopy: (content: string) => void;
  onViewHistory?: (message: ChatMessage) => void;
  onPin?: (message: ChatMessage) => void;
}

export default function MessageContextMenu({
  message,
  currentUserId,
  isGroup,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onStar,
  onCopy,
  onViewHistory,
  onPin,
}: MessageContextMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnMessage = message.userId === currentUserId;
  const canEdit = isOwnMessage && !message.deletedForEveryone;
  const canDeleteForEveryone = isOwnMessage && !message.deletedForEveryone;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowDeleteOptions(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCopy = () => {
    onCopy(message.content);
    setShowMenu(false);
  };

  const handleReply = () => {
    onReply(message);
    setShowMenu(false);
  };

  const handleEdit = () => {
    if (canEdit) {
      onEdit(message);
      setShowMenu(false);
    }
  };

  const handleDeleteClick = () => {
    if (canDeleteForEveryone) {
      setShowDeleteOptions(true);
    } else {
      onDelete(message, false);
      setShowMenu(false);
    }
  };

  const handleDeleteForMe = () => {
    onDelete(message, false);
    setShowMenu(false);
    setShowDeleteOptions(false);
  };

  const handleDeleteForEveryone = () => {
    onDelete(message, true);
    setShowMenu(false);
    setShowDeleteOptions(false);
  };

  const handleForward = () => {
    onForward(message);
    setShowMenu(false);
  };

  const handleStar = () => {
    onStar(message);
    setShowMenu(false);
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory(message);
      setShowMenu(false);
    }
  };

  if (message.deletedForEveryone) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded"
      >
        <MoreVertical size={16} className="text-zinc-400" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-6 z-50 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl min-w-[180px] py-1">
          {!showDeleteOptions ? (
            <>
              <button
                onClick={handleReply}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Reply size={16} />
                <span>Reply</span>
              </button>

              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
              )}

              {message.isEdited && onViewHistory && (
                <button
                  onClick={handleViewHistory}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <Clock size={16} />
                  <span>View History</span>
                </button>
              )}

              <button
                onClick={handleForward}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Forward size={16} />
                <span>Forward</span>
              </button>

              {isGroup && onPin && (
                <button
                  onClick={() => {
                    onPin(message);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-400 hover:bg-zinc-800 transition-colors"
                >
                  <Pin size={16} />
                  <span>Pin Message</span>
                </button>
              )}

              <button
                onClick={handleStar}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Star size={16} className={message.isStarred ? 'fill-yellow-500 text-yellow-500' : ''} />
                <span>{message.isStarred ? 'Unstar' : 'Star'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>

              <div className="h-px bg-zinc-800 my-1" />

              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-xs text-zinc-500 font-medium">
                Delete message
              </div>
              <button
                onClick={handleDeleteForMe}
                className="w-full flex flex-col gap-1 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <span className="font-medium">Delete for me</span>
                <span className="text-xs text-zinc-500">Only you won't see this</span>
              </button>
              <button
                onClick={handleDeleteForEveryone}
                className="w-full flex flex-col gap-1 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <span className="font-medium">Delete for everyone</span>
                <span className="text-xs text-zinc-500">Everyone won't see this</span>
              </button>
              <div className="h-px bg-zinc-800 my-1" />
              <button
                onClick={() => setShowDeleteOptions(false)}
                className="w-full px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

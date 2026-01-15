import { useState, useRef, useEffect } from 'react';
import { MessageReaction } from '@/types/chat';
import { Smile, Plus } from 'lucide-react';

interface ReactionPickerProps {
  messageId: string;
  reactions?: MessageReaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  className?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '👏', '🔥'];

export default function ReactionPicker({
  messageId,
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  className = '',
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    if (existingReaction?.userReacted) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setShowPicker(false);
  };

  const handleReactionClick = (reaction: MessageReaction) => {
    if (reaction.userReacted) {
      onRemoveReaction(reaction.emoji);
    } else {
      onAddReaction(reaction.emoji);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} ref={pickerRef}>
      {/* Display existing reactions */}
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all
            ${reaction.userReacted
              ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
              : 'bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }
          `}
          title={reaction.users.map(u => u.displayName).join(', ')}
        >
          <span className="text-base leading-none">{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className="text-xs font-medium">{reaction.count}</span>
          )}
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400"
          title="Add reaction"
        >
          {reactions.length > 0 ? (
            <Plus size={14} />
          ) : (
            <Smile size={14} />
          )}
        </button>

        {/* Emoji picker popup */}
        {showPicker && (
          <div className="absolute bottom-full mb-2 -left-2 z-[100] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 grid grid-cols-4 gap-1 min-w-[160px] animate-in zoom-in-95 duration-200">
            {QUICK_EMOJIS.map((emoji) => {
              const existingReaction = reactions.find(r => r.emoji === emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className={`
                    text-xl p-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center aspect-square
                    ${existingReaction?.userReacted ? 'bg-blue-500/20 ring-1 ring-blue-500/50' : ''}
                  `}
                  title={emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

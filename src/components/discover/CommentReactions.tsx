import React, { useState, useRef, useEffect } from 'react';
import { Smile, Plus } from 'lucide-react';
import { ReactionType } from '@/types/discover';

interface CommentReactionsProps {
  commentId: string;
  reactions: {
    LIKE: number;
    FUNNY: number;
    HELPFUL: number;
    INSIGHTFUL: number;
    HEART: number;
  };
  userReaction?: ReactionType | null;
  onReact: (commentId: string, reactionType: ReactionType) => Promise<void>;
  onRemoveReaction: (commentId: string) => Promise<void>;
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: '👍',
  FUNNY: '😄',
  HELPFUL: '💡',
  INSIGHTFUL: '🧠',
  HEART: '❤️'
};

const REACTION_LABELS: Record<ReactionType, string> = {
  LIKE: 'Like',
  FUNNY: 'Funny',
  HELPFUL: 'Helpful',
  INSIGHTFUL: 'Insightful',
  HEART: 'Heart'
};

// ... (imports remain same)

// ... (existing helper constants)

export function HeaderReactionPicker({
  commentId,
  userReaction,
  onReact,
  onRemoveReaction
}: Omit<CommentReactionsProps, 'reactions'>) {
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleReaction = async (reactionType: ReactionType) => {
    if (loading) return;
    setLoading(true);
    // Close picker
    setShowPicker(false);

    try {
      if (userReaction === reactionType) {
        await onRemoveReaction(commentId);
      } else {
        await onReact(commentId, reactionType);
      }
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center ml-2" ref={pickerRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(!showPicker);
        }}
        disabled={loading}
        className={`
          flex items-center justify-center rounded-full transition-all
          ${userReaction
            ? 'w-6 h-6 bg-blue-500/10 text-lg hover:bg-blue-500/20'
            : 'w-5 h-5 text-neutral-500 hover:text-white hover:bg-neutral-800'
          }
          ${loading && 'opacity-50 cursor-not-allowed'}
        `}
        title={userReaction ? REACTION_LABELS[userReaction] : "Add Reaction"}
      >
        {userReaction ? REACTION_EMOJIS[userReaction] : <Smile size={14} />}
      </button>

      {/* Picker Popup - Positioned relative to the trigger */}
      {showPicker && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/50 p-1.5 rounded-full shadow-xl backdrop-blur-sm">
            {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((reactionType) => {
              const isActive = userReaction === reactionType;
              return (
                <button
                  key={reactionType}
                  onClick={() => handleReaction(reactionType)}
                  className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-base
                    transition-transform hover:scale-125 hover:bg-white/10 active:scale-95
                    ${isActive ? 'bg-white/10 border border-white/20' : ''}
                  `}
                  title={REACTION_LABELS[reactionType]}
                >
                  {REACTION_EMOJIS[reactionType]}
                </button>
              );
            })}
          </div>
          {/* Active indicator dot below picker if needed, or just standard look */}
        </div>
      )}
    </div>
  );
}

export default function CommentReactions({
  // ... (existing implementation)
  commentId,
  reactions,
  userReaction,
  onReact,
  onRemoveReaction,
  showAddButton = true
}: CommentReactionsProps & { showAddButton?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  // Ensure reactions have default values
  const safeReactions = {
    LIKE: reactions?.LIKE || 0,
    FUNNY: reactions?.FUNNY || 0,
    HELPFUL: reactions?.HELPFUL || 0,
    INSIGHTFUL: reactions?.INSIGHTFUL || 0,
    HEART: reactions?.HEART || 0
  };

  const handleReaction = async (reactionType: ReactionType) => {
    if (loading) return;

    setLoading(true);
    // Close picker if open
    setShowPicker(false);

    try {
      if (userReaction === reactionType) {
        // Remove reaction if clicking the same one
        await onRemoveReaction(commentId);
      } else {
        // Add or change reaction
        await onReact(commentId, reactionType);
      }
    } catch (error) {
      console.error('Failed to react to comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyReactions = Object.values(safeReactions).some(count => count > 0);

  return (
    <div className="flex items-center gap-1.5 relative">
      {/* Existing Reactions Pills */}
      {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((reactionType) => {
        const count = safeReactions[reactionType];
        const isActive = userReaction === reactionType;

        // Only show reactions with count > 0 or if selected by user (even if count is 0 because optimistic update hasn't happened or something)
        if (count === 0 && !isActive) return null;

        return (
          <button
            key={reactionType}
            onClick={() => handleReaction(reactionType)}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
              transition-all duration-200 border
              ${isActive
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300 shadow-sm'
              }
              ${loading && 'opacity-50 cursor-not-allowed'}
            `}
            title={REACTION_LABELS[reactionType]}
          >
            <span className="text-sm scale-110">{REACTION_EMOJIS[reactionType]}</span>
            <span>{count}</span>
          </button>
        );
      })}

      {/* Add Reaction Button */}
      {showAddButton && (
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            disabled={loading}
            className={`
              flex items-center justify-center w-7 h-7 rounded-full
              text-neutral-500 transition-colors
              bg-transparent hover:bg-neutral-800 hover:text-neutral-300
              ${loading && 'opacity-50 cursor-not-allowed'}
              ${showPicker ? 'bg-neutral-800 text-neutral-300' : ''}
            `}
            title="Add Reaction"
          >
            {hasAnyReactions ? <Plus size={16} /> : <Smile size={18} />}
          </button>

          {/* Picker Popup */}
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50 animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2">
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/50 p-1.5 rounded-full shadow-xl backdrop-blur-sm">
                {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((reactionType) => {
                  const isActive = userReaction === reactionType;
                  return (
                    <button
                      key={reactionType}
                      onClick={() => handleReaction(reactionType)}
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-lg
                        transition-transform hover:scale-125 hover:bg-white/10 active:scale-95
                        ${isActive ? 'bg-white/10' : ''}
                      `}
                      title={REACTION_LABELS[reactionType]}
                    >
                      {REACTION_EMOJIS[reactionType]}
                    </button>
                  );
                })}
              </div>
              {/* Arrow/Tail */}
              <div className="absolute left-3 -bottom-1 w-2 h-2 bg-neutral-900 border-r border-b border-neutral-700/50 transform rotate-45" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Vote Buttons Component
 * Reusable voting UI for posts and comments
 */

'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteButtonsProps {
  voteType?: 'UP' | 'DOWN' | null;
  score: number;
  onUpvote: () => void;
  onDownvote: () => void;
  orientation?: 'vertical' | 'horizontal';
}

export default function VoteButtons({
  voteType,
  score,
  onUpvote,
  onDownvote,
  orientation = 'vertical'
}: VoteButtonsProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1`}>
      <button
        onClick={onUpvote}
        className={`p-2 rounded-lg transition-colors ${voteType === 'UP'
            ? 'text-orange-500 bg-orange-500/10'
            : 'text-neutral-500 hover:bg-neutral-800 hover:text-orange-500'
          }`}
        title="Upvote"
      >
        <ThumbsUp
          size={20}
          fill={voteType === 'UP' ? 'currentColor' : 'none'}
        />
      </button>

      <span className={`font-black text-sm ${voteType === 'UP' ? 'text-orange-500' :
          voteType === 'DOWN' ? 'text-indigo-500' :
            'text-neutral-300'
        }`}>
        {score >= 0 ? '+' : ''}{score}
      </span>

      <button
        onClick={onDownvote}
        className={`p-2 rounded-lg transition-colors ${voteType === 'DOWN'
            ? 'text-indigo-500 bg-indigo-500/10'
            : 'text-neutral-500 hover:bg-neutral-800 hover:text-indigo-500'
          }`}
        title="Downvote"
      >
        <ThumbsDown
          size={20}
          fill={voteType === 'DOWN' ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  );
}

/**
 * Sort Menu Component
 * Dropdown for sorting posts
 */

'use client';

interface SortMenuProps {
  sortBy: 'hot' | 'new' | 'top' | 'trending';
  onSortChange: (sort: 'hot' | 'new' | 'top' | 'trending') => void;
}

import { Flame, Sparkles, Trophy, TrendingUp } from 'lucide-react';

interface SortMenuProps {
  sortBy: 'hot' | 'new' | 'top' | 'trending';
  onSortChange: (sort: 'hot' | 'new' | 'top' | 'trending') => void;
}

export default function SortMenu({ sortBy, onSortChange }: SortMenuProps) {
  const options = [
    { value: 'hot' as const, label: 'Hot', icon: Flame },
    { value: 'new' as const, label: 'New', icon: Sparkles },
    { value: 'top' as const, label: 'Top', icon: Trophy },
    { value: 'trending' as const, label: 'Trending', icon: TrendingUp }
  ];

  return (
    <div className="flex gap-2 pb-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value)}
          className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${sortBy === option.value
              ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
              : 'bg-black text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white'
            }`}
        >
          <option.icon size={14} className={sortBy === option.value ? 'text-black' : ''} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

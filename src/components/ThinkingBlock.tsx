'use client';

import { useState } from 'react';
import { ChevronDown, Brain } from 'lucide-react';

interface ThinkingBlockProps {
  thinking: string;
}

export default function ThinkingBlock({ thinking }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinking || thinking.trim().length === 0) {
    return null;
  }

  const lines = thinking.split('\n').filter(line => line.trim());
  const preview = lines[0] || '';

  return (
    <div className="mb-3 md:mb-4 rounded-lg md:rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 overflow-hidden max-w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 md:px-4 md:py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-purple-300">AI Reasoning</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 md:w-5 md:h-5 text-purple-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded ? (
        <div className="px-3 py-2 md:px-4 md:py-3 border-t border-purple-500/20 custom-scrollbar">
          <div className="space-y-1 font-mono text-xs md:text-sm text-purple-200/90 whitespace-pre-wrap break-words">
            {thinking}
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 md:px-4 md:py-3 border-t border-purple-500/20">
          <div className="font-mono text-xs md:text-sm text-purple-200/70 line-clamp-2 whitespace-pre-wrap break-words max-w-full">
            {preview}
          </div>
        </div>
      )}
    </div>
  );
}

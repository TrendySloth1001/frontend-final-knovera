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
          {/* Vertical Timeline */}
          <div className="relative pl-8 md:pl-10">
            {/* Vertical guide line - YELLOW */}
            <div className="absolute left-2 md:left-2.5 top-0 bottom-0 w-[2px] bg-yellow-500/60"></div>
            
            {/* Timeline steps */}
            <div className="space-y-4 md:space-y-5">
              {lines.map((line, index) => (
                <div key={index} className="relative">
                  {/* Node/Dot - YELLOW */}
                  <div className="absolute -left-[29px] md:-left-[37px] top-[2px]">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-md shadow-yellow-500/40"></div>
                  </div>
                  
                  {/* Horizontal connector line from node to content - YELLOW */}
                  <div className="absolute -left-6 md:-left-[30px] top-[6px] md:top-[7px] w-4 md:w-5 h-[1.5px] bg-yellow-500/50"></div>
                  
                  {/* Step content - PURPLE theme */}
                  <div className="font-mono text-xs md:text-sm text-purple-200/90 whitespace-pre-wrap break-words leading-relaxed">
                    {line}
                  </div>
                </div>
              ))}
            </div>
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

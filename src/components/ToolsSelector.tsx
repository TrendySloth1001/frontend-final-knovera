'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Wrench, Globe, Brain } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface ToolsSelectorProps {
  webSearchEnabled: boolean;
  onWebSearchChange: (enabled: boolean) => void;
  enableQuiz: boolean;
  onEnableQuizChange: (enabled: boolean) => void;
}

export default function ToolsSelector({ 
  webSearchEnabled, 
  onWebSearchChange,
  enableQuiz,
  onEnableQuizChange
}: ToolsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const tools: Tool[] = [
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the internet for information',
      icon: <Globe size={18} />,
      enabled: webSearchEnabled,
    },
    {
      id: 'quiz',
      name: 'Quiz Mode',
      description: 'Generate interactive quizzes',
      icon: <Brain size={18} />,
      enabled: enableQuiz,
    },
  ];

  const activeCount = tools.filter(t => t.enabled).length;

  const handleToggle = (toolId: string) => {
    switch (toolId) {
      case 'web-search':
        onWebSearchChange(!webSearchEnabled);
        break;
      case 'quiz':
        onEnableQuizChange(!enableQuiz);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Capsule Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[30px] px-3 rounded-full border transition-all flex items-center gap-1.5 group ${
          activeCount > 0
            ? 'bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30'
            : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
        }`}
        title={activeCount > 0 ? `${activeCount} tool${activeCount > 1 ? 's' : ''} active` : 'Select tools'}
      >
        <Wrench size={12} className={activeCount > 0 ? 'text-purple-300' : 'text-white/60 group-hover:text-white/80'} />
        <span className={`text-xs font-medium ${activeCount > 0 ? 'text-purple-200' : 'text-white/80 group-hover:text-white'}`}>
          Tools
        </span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
        <ChevronDown 
          size={12} 
          className={`${activeCount > 0 ? 'text-purple-300' : 'text-white/60 group-hover:text-white/80'} transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-black border border-white/20 rounded-lg shadow-xl z-[100]">
          <div className="sticky top-0 bg-black border-b border-white/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <Wrench size={14} className="text-white/60" />
              <span className="text-sm font-semibold text-white">AI Tools</span>
            </div>
          </div>

          <div className="p-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToggle(tool.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all mb-1 last:mb-0 ${
                  tool.enabled
                    ? 'bg-purple-500/20 border border-purple-500/40'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    tool.enabled
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${tool.enabled ? 'text-purple-200' : 'text-white'}`}>
                        {tool.name}
                      </span>
                      {tool.enabled && (
                        <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded flex-shrink-0">
                          ON
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="sticky bottom-0 bg-black border-t border-white/10 px-3 py-2">
            <p className="text-[10px] text-white/40 text-center">
              Click to toggle tools on/off
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

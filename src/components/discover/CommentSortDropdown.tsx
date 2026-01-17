"use client";

import React from 'react';

export type CommentSortOption = 'best' | 'new' | 'old' | 'top' | 'controversial';

interface CommentSortDropdownProps {
  currentSort: CommentSortOption;
  onSortChange: (sort: CommentSortOption) => void;
}

const SORT_OPTIONS: { value: CommentSortOption; label: string; description: string }[] = [
  { value: 'best', label: 'Best', description: 'Highest quality comments with time decay' },
  { value: 'top', label: 'Top', description: 'Highest voted comments' },
  { value: 'new', label: 'New', description: 'Newest comments first' },
  { value: 'old', label: 'Old', description: 'Oldest comments first' },
  { value: 'controversial', label: 'Controversial', description: 'Most debated comments' }
];

export default function CommentSortDropdown({ currentSort, onSortChange }: CommentSortDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

  const handleSelect = (sort: CommentSortOption) => {
    onSortChange(sort);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <svg
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sort: {currentOption.label}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
                ${currentSort === option.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium text-sm ${currentSort === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {option.description}
                  </div>
                </div>
                {currentSort === option.value && (
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

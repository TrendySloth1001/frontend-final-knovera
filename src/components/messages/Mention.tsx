import React from 'react';

interface MentionProps {
  userId: string;
  displayName: string;
  onClick?: (userId: string) => void;
}

export default function Mention({ userId, displayName, onClick }: MentionProps) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(userId);
      }}
      title={`View profile of ${displayName}`}
    >
      @{displayName}
    </span>
  );
}

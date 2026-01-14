'use client';

import { UserPlus, UserMinus, Users } from 'lucide-react';

interface SystemMessageProps {
  type: 'user_joined' | 'user_left' | 'group_created';
  username?: string;
  content: string;
  createdAt: string;
}

export default function SystemMessage({ type, username, content, createdAt }: SystemMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'user_joined':
        return <UserPlus size={14} className="text-green-400" />;
      case 'user_left':
        return <UserMinus size={14} className="text-red-400" />;
      case 'group_created':
        return <Users size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center my-3">
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 max-w-md">
        {getIcon()}
        <span className="text-xs text-zinc-400 text-center">
          {content}
        </span>
        <span className="text-[10px] text-zinc-600">
          {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

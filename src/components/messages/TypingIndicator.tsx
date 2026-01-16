'use client';

import { ChatConversation } from '@/types/chat';

interface TypingIndicatorProps {
  typingUserIds: Set<string>;
  conversation: ChatConversation | null;
}

export default function TypingIndicator({ typingUserIds, conversation }: TypingIndicatorProps) {
  if (!conversation || typingUserIds.size === 0) return null;

  // Get the typing users from the conversation members
  const typingUsers = conversation.members
    .filter((member) => typingUserIds.has(member.userId))
    .map((member) => member.user);

  if (typingUsers.length === 0) return null;

  // Get the first typing user for avatar display
  const firstUser = typingUsers[0];

  // Create typing text
  let typingText = '';
  if (typingUsers.length === 1) {
    typingText = `${firstUser.displayName} is typing`;
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`;
  } else {
    typingText = `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <div className="flex justify-start">
      <div className="flex gap-2 items-center">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {firstUser.avatarUrl ? (
            <img
              src={firstUser.avatarUrl}
              alt={firstUser.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-neutral-500">
              {firstUser.displayName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Typing indicator bubble */}
        <div className="bg-neutral-800 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-neutral-400 ml-1">{typingText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

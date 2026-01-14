'use client';

import { useRef } from 'react';
import { ChatMessage, ChatConversation } from '@/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUsers: Set<string>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  conversation: ChatConversation | null;
  onAvatarClick?: (userId: string) => void;
}

export default function MessagesList({ messages, currentUserId, typingUsers, messagesEndRef, conversation, onAvatarClick }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          isOwn={msg.userId === currentUserId}
          currentUserId={currentUserId}
          isGroup={conversation?.isGroup}
          onAvatarClick={onAvatarClick}
        />
      ))}

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <TypingIndicator
          typingUserIds={typingUsers}
          conversation={conversation}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

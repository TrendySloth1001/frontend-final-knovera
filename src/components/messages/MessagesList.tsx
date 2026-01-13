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
}

export default function MessagesList({
  messages,
  currentUserId,
  typingUsers,
  messagesEndRef,
  conversation,
}: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isOwn = msg.userId === currentUserId;
        return (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={isOwn}
            currentUserId={currentUserId}
          />
        );
      })}

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

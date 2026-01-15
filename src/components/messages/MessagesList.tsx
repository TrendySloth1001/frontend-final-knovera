'use client';

import { useRef } from 'react';
import { ChatMessage, ChatConversation } from '@/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import DateSeparator from './DateSeparator';
import SystemMessage from './SystemMessage';

interface MessagesListProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUsers: Set<string>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  conversation: ChatConversation | null;
  onAvatarClick?: (userId: string) => void;
  onReplyToMessage?: (message: ChatMessage) => void;
  messageRefs?: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  highlightedMessageId?: string | null;
  onScrollToMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string, forEveryone: boolean) => void;
  onForwardMessage?: (messageId: string) => void;
  onStarMessage?: (messageId: string) => void;
  onUnstarMessage?: (messageId: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onViewHistory?: (messageId: string) => void;
  onPinMessage?: (messageId: string) => void;
}

export default function MessagesList({ messages, currentUserId, typingUsers, messagesEndRef, conversation, onAvatarClick, onReplyToMessage, messageRefs, highlightedMessageId, onScrollToMessage, onEditMessage, onDeleteMessage, onForwardMessage, onStarMessage, onUnstarMessage, onAddReaction, onRemoveReaction, onViewHistory, onPinMessage }: MessagesListProps) {
  // Helper to check if two dates are on different days
  const isDifferentDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() !== d2.toDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
      {messages.map((msg, index) => {
        const showDateSeparator = index === 0 || isDifferentDay(messages[index - 1].createdAt, msg.createdAt);
        const isSystemMessage = msg.messageType && msg.messageType.startsWith('system_');

        return (
          <div key={msg.id}>
            {/* Date Separator */}
            {showDateSeparator && <DateSeparator date={msg.createdAt} />}
            
            {/* System Message or Regular Message */}
            {isSystemMessage ? (
              <SystemMessage
                type={msg.messageType as any}
                username={msg.user?.displayName}
                content={msg.content}
                createdAt={msg.createdAt}
              />
            ) : (
              <div className="mb-4">
                <MessageBubble
                  msg={msg}
                  isOwn={msg.userId === currentUserId}
                  currentUserId={currentUserId}
                  isGroup={conversation?.isGroup}
                  onAvatarClick={onAvatarClick}
                  onReplyToMessage={onReplyToMessage}
                  messageRef={(el) => messageRefs && (messageRefs.current[msg.id] = el)}
                  isHighlighted={highlightedMessageId === msg.id}
                  onScrollToMessage={onScrollToMessage}
                  onEditMessage={onEditMessage}
                  onDeleteMessage={onDeleteMessage}
                  onForwardMessage={onForwardMessage}
                  onStarMessage={onStarMessage}
                  onUnstarMessage={onUnstarMessage}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onViewHistory={onViewHistory}
                  onPinMessage={onPinMessage}
                />
              </div>
            )}
          </div>
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

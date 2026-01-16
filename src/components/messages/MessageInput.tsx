'use client';

import { useRef, useState, useEffect } from 'react';
import { Send, Plus, Smile, Image as ImageIcon, X } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import MentionAutocomplete from './MentionAutocomplete';
import { insertMention } from '@/utils/mentionParser';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: (content?: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
  conversationId?: string;
  authToken?: string | null;
  currentUserId?: string;
}

interface Member {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  role: string;
}

export default function MessageInput({
  messageInput,
  setMessageInput,
  isSending,
  onSendMessage,
  onFileSelect,
  onTyping,
  replyingTo,
  onCancelReply,
  conversationId,
  authToken,
  currentUserId,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Get API base URL - chat API is on port 3001
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
    : 'http://localhost:3001/api/chat';

  // Fetch members when conversationId changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!conversationId || !authToken || !currentUserId) return;

      try {
        setLoadingMembers(true);
        const response = await fetch(
          `${API_BASE_URL}/conversations/${conversationId}/members?requesterId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          // Silently fail specific errors or handle gracefully
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [conversationId, authToken, currentUserId, API_BASE_URL]);

  // Detect @ mentions in text
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;

    setMessageInput(value);

    // Auto-height logic
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Typing indicator
    if (value.trim()) {
      onTyping(true);
    } else {
      onTyping(false);
    }

    // Check for @ mention
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @ and we're still in the mention
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);

        // Calculate position for dropdown
        if (textareaRef.current) {
          const rect = textareaRef.current.getBoundingClientRect();
          // Position above the textarea
          setMentionPosition({
            top: rect.top - 10, // Will be adjusted to show above with transform
            left: rect.left + 50, // Slight offset from left
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (member: Member) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart || 0;

    // Find start of mention
    let mentionStart = cursorPosition - 1;
    const text = messageInput;
    while (mentionStart > 0 && text[mentionStart] !== '@') {
      mentionStart--;
    }

    // Insert just the display name
    const mention = `@${member.displayName}`;
    const newText =
      text.slice(0, mentionStart) + mention + ' ' + text.slice(cursorPosition);

    const newCursorPos = mentionStart + mention.length + 1;

    setMessageInput(newText);
    setShowMentions(false);
    setMentionQuery('');

    // Store mapping for this session
    // Ideally this should be more robust (e.g. handle deletions), but this is a starting point
    // We could store it in a ref or just map it on send
    // For now, let's rely on looking up members by name on send if possible, 
    // OR just use the standard format if the user is okay with it.
    // BUT the user explicitly asked for clean text. 
    // So we will stick to the plan: clean text in UI, standard text in backend.

    // However, without a robust state to track *which* @Nick corresponds to which ID (if duplicate names),
    // it's risky. Assuming unique names or just using the first match on send is a trade-off.
    // A better way is to keep a 'mentions' array in state.

    // Focus back
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSend = () => {
    // Replace clean mentions with ID format before sending
    let processedText = messageInput;

    // Use regex to replace specific mentions robustly
    // Sort members by display name length (descending) to match longest names first
    // This prevents partial matches if one name contains another (e.g. @JohnDoe vs @John)
    const sortedMembers = [...members].sort((a, b) => b.displayName.length - a.displayName.length);

    sortedMembers.forEach(member => {
      // Escape special regex characters in the display name
      const escapedName = member.displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match @Name ensuring it's not preceded by word char (unless it's start of string)
      // and not followed by word char. 
      // Note: We use a capturing group for the @ to preserve it if needed or just replace the whole thing.
      // We want to replace "@Name" with "@[id:Name]"
      const regex = new RegExp(`@${escapedName}(?![\\w])`, 'g');

      if (regex.test(processedText)) {
        const replacement = `@[${member.userId}:${member.displayName}]`;
        processedText = processedText.replace(regex, replacement);
      }
    });

    onSendMessage(processedText);
  };

  return (
    <footer className="p-4 border-t border-zinc-800 bg-black">
      {/* Mention Autocomplete */}
      {showMentions && members.length > 0 && (
        <MentionAutocomplete
          members={members}
          query={mentionQuery}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentions(false)}
          position={mentionPosition}
        />
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 max-w-5xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-400 mb-1">
              Replying to {replyingTo.user?.displayName || 'Unknown User'}
            </div>
            <div className="text-sm text-zinc-500 truncate">
              {replyingTo.content}
            </div>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="ml-2 p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end gap-3 max-w-5xl mx-auto"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
        />
        <div className="flex-1 relative flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 text-zinc-500 hover:text-white transition-colors"
          >
            <Plus size={20} />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={messageInput}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              // Don't submit if mention autocomplete is open and Enter is pressed
              if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
                e.preventDefault();
                onSendMessage();
              } else if (e.key === 'Escape' && showMentions) {
                e.preventDefault();
                setShowMentions(false);
              }
            }}
            onBlur={() => {
              onTyping(false);
              // Delay closing mentions to allow click on dropdown
              setTimeout(() => setShowMentions(false), 200);
            }}
            placeholder="Type a message... (@mention users)"
            className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-zinc-600 transition-all resize-none max-h-32 scrollbar-hide"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button type="button" className="text-zinc-500 hover:text-white transition-colors">
              <Smile size={18} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <ImageIcon size={18} />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!messageInput.trim() || isSending}
          className={`p-3 rounded-xl transition-all ${messageInput.trim() && !isSending
            ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-lg shadow-white/10'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
        >
          <Send size={20} />
        </button>
      </form>
    </footer>
  );
}

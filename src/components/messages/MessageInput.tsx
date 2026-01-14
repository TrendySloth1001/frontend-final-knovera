'use client';

import { useRef } from 'react';
import { Send, Plus, Smile, Image as ImageIcon, X } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo?: ChatMessage | null;
  onCancelReply?: () => void;
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
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <footer className="p-4 border-t border-zinc-800 bg-black">
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
          onSendMessage();
        }}
        className="flex items-end gap-3 max-w-5xl mx-auto"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*"
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
            rows={1}
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              // Simple auto-height logic
              e.target.style.height = 'inherit';
              e.target.style.height = `${e.target.scrollHeight}px`;
              if (e.target.value.trim()) {
                onTyping(true);
              } else {
                onTyping(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            onBlur={() => onTyping(false)}
            placeholder="Type a message..."
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

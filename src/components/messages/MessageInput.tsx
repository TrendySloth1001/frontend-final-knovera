'use client';

import { useRef } from 'react';
import { Send, Plus, Smile, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({
  messageInput,
  setMessageInput,
  isSending,
  onSendMessage,
  onFileSelect,
  onTyping,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <footer className="p-4 border-t border-zinc-800 bg-black">
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

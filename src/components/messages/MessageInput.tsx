'use client';

import { useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

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
    <div className="p-4 border-t border-neutral-800">
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <div className="flex-1 relative">
          <textarea
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
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
            rows={1}
            className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white resize-none max-h-32"
          />
        </div>
        <button
          onClick={onSendMessage}
          disabled={!messageInput.trim() || isSending}
          className="p-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

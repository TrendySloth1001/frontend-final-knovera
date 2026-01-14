'use client';

import { MessageSquare } from 'lucide-react';

export default function EmptyChatView() {
  return (
    <div className="flex items-center justify-center h-full bg-[#000000]">
      <div className="text-center p-8 space-y-4">
        <div className="w-20 h-20 bg-zinc-900/50 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800">
          <MessageSquare size={32} className="text-zinc-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Select a conversation</h3>
          <p className="text-zinc-500 text-sm max-w-[280px] mx-auto mt-2">
            Choose a chat from the left or start a new one to begin messaging.
          </p>
        </div>
      </div>
    </div>
  );
}

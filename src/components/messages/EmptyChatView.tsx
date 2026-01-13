'use client';

import Image from 'next/image';
import { MessageSquare } from 'lucide-react';

export default function EmptyChatView() {
  return (
    <div className="flex-1 relative text-neutral-500 overflow-hidden">
      
      {/* Center illustration */}
      <div className="flex items-center justify-center min-h-[65vh] sm:min-h-[70vh]">
        <Image
          src="/massages/Work chat-cuate.png"
          alt="Start chatting"
          width={500}
          height={500}
          priority
          className="
            w-full 
            max-w-[260px] 
            sm:max-w-[320px] 
            md:max-w-sm 
            h-auto 
            opacity-90 
            select-none
          "
        />
      </div>

      {/* Bottom helper text (responsive + centered) */}
      <div
        className="
          absolute 
          left-1/2 -translate-x-1/2 
          text-center select-none

          bottom-16        /* phones */
          sm:bottom-20     /* tablets */
          md:bottom-28     /* laptops */
          lg:bottom-32     /* large screens */
        "
      >
        <MessageSquare
          size={22}
          className="mx-auto mb-2 opacity-40"
        />

        <p className="text-xs sm:text-sm text-white/70">
          Select a conversation
        </p>

        <p className="text-[11px] sm:text-xs text-white/40">
          or start a new one
        </p>
      </div>

    </div>
  );
}

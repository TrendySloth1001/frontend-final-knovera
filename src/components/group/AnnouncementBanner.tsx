'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { getAnnouncements } from '@/lib/groupManagementApi';

interface AnnouncementBannerProps {
  conversationId: string;
  onClose?: () => void;
}

export default function AnnouncementBanner({
  conversationId,
  onClose,
}: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, [conversationId]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements(conversationId);
      setAnnouncements(data as ChatMessage[]);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onClose?.();
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading || !isVisible || announcements.length === 0) return null;
  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-black/80 backdrop-blur-md border-b border-zinc-800 animate-slideDown relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                Announcement
              </span>
              <span className="text-xs text-zinc-400">
                by <span className="text-zinc-200 font-medium">{currentAnnouncement.user?.displayName || 'Admin'}</span>
              </span>
              <span className="text-xs text-zinc-500">
                • {formatTimestamp(currentAnnouncement.createdAt)}
              </span>
            </div>
            <p className="text-zinc-200 text-sm font-medium truncate leading-relaxed">
              {currentAnnouncement.content}
            </p>
          </div>

          {/* Navigation (if multiple announcements) */}
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={handlePrev}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-zinc-500 font-medium min-w-[2rem] text-center tabular-nums">
                {currentIndex + 1}/{announcements.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="p-2 -mr-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

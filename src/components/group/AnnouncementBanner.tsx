'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { getAnnouncements } from '@/lib/groupManagementApi';

interface AnnouncementBannerProps {
  conversationId: string;
  onClose?: () => void;
  onAnnouncementClick?: (messageId: string) => void;
}

export default function AnnouncementBanner({
  conversationId,
  onClose,
  onAnnouncementClick,
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
      // Sort by newest first just in case
      const sorted = (data as ChatMessage[]).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAnnouncements(sorted);
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

  const getTruncatedContent = (content: string) => {
    const words = content.split(/\s+/);
    if (words.length <= 6) return content;
    return words.slice(0, 6).join(' ') + '...';
  };

  const handleBannerClick = () => {
    if (onAnnouncementClick && currentAnnouncement) {
      onAnnouncementClick(currentAnnouncement.id);
    }
  };

  if (loading || !isVisible || announcements.length === 0) return null;
  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="bg-black/80 backdrop-blur-md border-b border-zinc-800 animate-slideDown relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar - Clickable to scroll */}
          <div className="flex-shrink-0 cursor-pointer" onClick={handleBannerClick}>
            <div className="w-9 h-9 rounded-full ring-2 ring-zinc-800 bg-zinc-900 overflow-hidden">
              {currentAnnouncement.user?.avatarUrl ? (
                <img
                  src={currentAnnouncement.user.avatarUrl}
                  alt={currentAnnouncement.user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-semibold text-xs">
                  {currentAnnouncement.user?.displayName?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
              )}
            </div>
          </div>

          {/* Content - Clickable to scroll */}
          <div className="flex-1 min-w-0 cursor-pointer group" onClick={handleBannerClick}>
            <div className="flex items-center flex-wrap gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                Announcement
              </span>
              <span className="text-xs text-zinc-400">
                by <span className="text-zinc-200 font-medium group-hover:underline">{currentAnnouncement.user?.displayName || 'Admin'}</span>
              </span>
              <span className="text-xs text-zinc-500">
                • {formatTimestamp(currentAnnouncement.createdAt)}
              </span>
            </div>
            <p className="text-zinc-200 text-sm font-medium truncate leading-relaxed group-hover:text-white transition-colors">
              {getTruncatedContent(currentAnnouncement.content)}
            </p>
          </div>

          {/* Navigation (if multiple announcements) */}
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800 ml-2">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[10px] text-zinc-500 font-medium min-w-[2rem] text-center tabular-nums">
                {currentIndex + 1}/{announcements.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="p-2 -mr-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors ml-1"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

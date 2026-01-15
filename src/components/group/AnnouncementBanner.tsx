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
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500/50 shadow-lg animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                Announcement
              </span>
              <span className="text-xs text-white/70">
                by {currentAnnouncement.user?.displayName || 'Admin'}
              </span>
              <span className="text-xs text-white/60">
                • {formatTimestamp(currentAnnouncement.createdAt)}
              </span>
            </div>
            <p className="text-white font-medium text-sm truncate">
              {currentAnnouncement.content}
            </p>
          </div>

          {/* Navigation (if multiple announcements) */}
          {announcements.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/80 font-medium min-w-[3rem] text-center">
                {currentIndex + 1} / {announcements.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-white/20 text-white transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

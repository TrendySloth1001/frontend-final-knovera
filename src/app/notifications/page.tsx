'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Bell,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCheck
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadCountRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  // Poll notifications every 10 seconds
  useEffect(() => {
    if (!user?.user?.id) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user?.user?.id]);

  const loadNotifications = async () => {
    try {
      if (!user?.user?.id) return;
      const response = await apiClient.get<any>(`/api/notifications?userId=${user.user.id}`);
      
      const newNotifications = response.data || [];
      const newUnreadCount = response.meta?.unreadCount || 0;
      
      previousUnreadCountRef.current = newUnreadCount;
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`, { userId: user?.user?.id });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifs.map(notif => 
          apiClient.patch(`/api/notifications/${notif.id}/read`, { userId: user?.user?.id })
        )
      );
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-neutral-800">
      
      {/* Header */}
      <header className="border-b border-neutral-800 sticky top-0 bg-[#000000] z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-light tracking-tight">Notifications</h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium border border-neutral-800 px-3 py-1.5 rounded-full hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-neutral-500" />
            </div>
            <h2 className="text-lg font-medium text-neutral-300 mb-2">No notifications</h2>
            <p className="text-sm text-neutral-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-0 border-y border-neutral-800">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`flex items-start gap-4 py-5 px-4 border-b border-neutral-800 group cursor-pointer transition-colors ${
                  notif.isRead 
                    ? 'hover:bg-neutral-950' 
                    : 'bg-neutral-950/50 hover:bg-neutral-950'
                }`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  notif.isRead ? 'bg-neutral-700' : 'bg-blue-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium mb-1 group-hover:text-neutral-300 transition-colors">
                    {notif.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <span>
                      {new Date(notif.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                      }}
                      className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} className="text-neutral-500 hover:text-white" />
                    </button>
                  )}
                  <ArrowUpRight 
                    size={16} 
                    className="text-neutral-700 group-hover:text-white transition-colors" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

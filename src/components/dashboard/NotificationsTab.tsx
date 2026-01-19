import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCheck, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

interface NotificationsTabProps {
  notifications: any[];
  changeTab: (tab: string) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
}

export default function NotificationsTab({
  notifications: initialNotifications,
  changeTab,
  markNotificationAsRead,
}: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Since we don't have a delete API prop passed down, this is just a local UI dismissal for now,
    // or we could assume marking as read "dismisses" it from the unread view if that was the intent.
    // For now, we just remove it from the view.
    markNotificationAsRead(id);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    markNotificationAsRead(id);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  // Helper to map backend fields to our component props if they differ
  const mapNotification = (n: any): any => ({
    ...n,
    // Ensure we have a type, defaulting to info if not present
    type: n.type || 'info',
    read: n.read || n.isRead || false,
    message: n.message || n.content || 'No content',
    title: n.title || 'Notification',
    // Ensure time/createdAt is passed through for date display
    time: n.time,
    createdAt: n.createdAt || n.created_at || n.timestamp,
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="hidden sm:flex items-center space-x-3">
          <button
            onClick={() => changeTab('Overview')}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors group"
          >
            <ArrowLeft size={20} className="text-neutral-400 group-hover:text-white" />
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">Notifications</h3>
            {notifications.some(n => !n.read || !n.isRead) && (
              <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
                {notifications.filter(n => !n.read && !n.isRead).length} New
              </span>
            )}
          </div>
        </div>

        {/* Mobile-only status bar since title is hidden */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <span className="text-sm font-medium text-neutral-400">
            {notifications.some(n => !n.read || !n.isRead)
              ? `${notifications.filter(n => !n.read && !n.isRead).length} Unread`
              : 'All caught up'}
          </span>
          {notifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Mark all read</span>
              <CheckCheck size={14} />
            </button>
          )}
        </div>

        {/* Desktop Mark all read */}
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="hidden sm:flex text-sm font-medium text-neutral-500 hover:text-blue-400 items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10 whitespace-nowrap"
          >
            <span>Mark all read</span>
            <CheckCheck size={16} />
          </button>
        )}
      </div>

      <div className="bg-black border border-neutral-800 rounded-2xl overflow-hidden">
        {notifications.length > 0 ? (
          <div>
            {notifications.map((notif: any) => (
              <NotificationItem
                key={notif.id}
                notification={mapNotification(notif)}
                onDismiss={handleDismiss}
                onMarkRead={handleMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-4 bg-neutral-900/10">
            <div className="w-16 h-16 bg-neutral-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800/50">
              <Bell className="w-8 h-8 text-neutral-700" />
            </div>
            <h4 className="text-neutral-200 font-medium mb-1">All caught up!</h4>
            <p className="text-neutral-500 text-sm">No new notifications to show.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <p className="mt-8 text-center text-xs text-neutral-600">
          Tip: You can customize these alerts in your <button onClick={() => changeTab('Settings')} className="text-blue-500 hover:underline cursor-pointer">Settings</button>.
        </p>
      )}
    </div>
  );
}

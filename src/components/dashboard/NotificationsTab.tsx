import { ArrowLeft, CheckCheck, ArrowUpRight } from 'lucide-react';

interface NotificationsTabProps {
  notifications: any[];
  changeTab: (tab: string) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
}

export default function NotificationsTab({
  notifications,
  changeTab,
  markNotificationAsRead,
}: NotificationsTabProps) {
  return (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => changeTab('Overview')}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-semibold">Notifications</h3>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <p className="text-sm text-neutral-400">{notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => {
                notifications.forEach((n: any) => markNotificationAsRead(n.id));
              }}
              className="text-xs text-neutral-400 hover:text-white flex items-center group"
            >
              Mark all read <CheckCheck size={14} className="ml-1" />
            </button>
          </div>

          <div className="space-y-0 border-t border-neutral-800">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className="flex items-start sm:items-center justify-between py-4 sm:py-5 border-b border-neutral-800 group cursor-pointer px-2 sm:px-0"
              >
                <div className="flex flex-col flex-1 min-w-0 pr-4">
                  <span className="text-sm font-medium group-hover:text-neutral-300 transition-colors truncate">{notif.title}</span>
                  <span className="text-xs text-neutral-500 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs mb-6">
            <img
              src="/notification/New message-cuate.png"
              alt="No notifications"
              className="w-full h-auto opacity-90"
            />
          </div>
          <p className="text-neutral-500 text-sm">No unread notifications</p>
        </div>
      )}
    </>
  );
}

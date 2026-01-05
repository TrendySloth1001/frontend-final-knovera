'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-400" />;
  }
};

const getBorderColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'border-green-500/40';
    case 'error':
      return 'border-red-500/40';
    case 'warning':
      return 'border-yellow-500/40';
    case 'info':
      return 'border-blue-500/40';
  }
};

export default function Notification({ id, type, message, onClose, duration = 4000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-black border ${getBorderColor(type)} rounded-lg shadow-xl min-w-[320px] animate-slide-in`}
    >
      <NotificationIcon type={type} />
      <p className="flex-1 text-white text-sm">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

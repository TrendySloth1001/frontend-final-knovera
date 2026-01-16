'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    Zap,
    MoreVertical
} from 'lucide-react';


interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'mention' | 'default';
    title: string;
    message: string;
    time?: string;
    createdAt?: string; // Fallback for time
    read: boolean;
    actionLabel?: string;
    [key: string]: any;
}

interface NotificationItemProps {
    notification: Notification;
    onDismiss: (id: string) => void;
    onMarkRead: (id: string) => void;
}

export default function NotificationItem({ notification, onDismiss, onMarkRead }: NotificationItemProps) {
    const [isExit, setIsExit] = useState(false);
    const router = useRouter();

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExit(true);
        setTimeout(() => onDismiss(notification.id), 300);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            case 'mention': return <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">JD</div>;
            default: return <Zap className="w-5 h-5 text-purple-500" />;
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const displayTime = notification.time || formatTime(notification.createdAt);

    return (
        <div
            onClick={() => !notification.read && onMarkRead(notification.id)}
            className={`
        relative group overflow-hidden bg-black
        border border-neutral-800 rounded-xl p-4 
        hover:border-neutral-700 hover:bg-neutral-900/50 transition-all duration-300 ease-out
        ${isExit ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100'}
        ${!notification.read ? 'border-l-2 border-l-blue-500 bg-neutral-900/30' : ''}
        cursor-default
      `}
        >
            <div className="flex gap-4">
                {/* Icon/Avatar Section */}
                <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type || 'default')}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold truncate ${!notification.read ? 'text-white' : 'text-neutral-300'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[11px] font-medium text-neutral-500">
                            {displayTime}
                        </span>
                    </div>

                    <p className="text-sm text-neutral-400 leading-relaxed mb-3">
                        {notification.message}
                    </p>

                    {/* Action Area */}
                    <div className="flex items-center gap-3">
                        {notification.actionLabel && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.actionLink) {
                                        router.push(notification.actionLink);
                                    }
                                }}
                                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 group/btn transition-colors"
                            >
                                {notification.actionLabel}
                                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>

                {/* Options */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-800 rounded-md h-fit text-neutral-400">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Unread Indicator */}
            {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
        </div>
    );
}

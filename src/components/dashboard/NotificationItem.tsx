'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    Zap,
    MoreVertical,
    User as UserIcon
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
            case 'mention':
                if (notification.metadata?.fromUserAvatar) {
                    return (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={notification.metadata.fromUserAvatar}
                                alt={notification.metadata.fromUserName || "User"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    );
                }

                const initials = notification.metadata?.fromUserName
                    ? notification.metadata.fromUserName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : null;

                if (initials) {
                    return (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
                            {initials}
                        </div>
                    );
                }

                return (
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                        <UserIcon size={14} />
                    </div>
                );
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
                relative group flex gap-4 p-5 transition-all duration-200
                ${!notification.read ? 'bg-blue-500/5' : 'hover:bg-neutral-900/30'}
                border-b border-neutral-800/50 last:border-0
                cursor-default
                ${isExit ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}
            `}
        >
            {/* Unread Indicator Dot - Positioned absolutely to the left or inline */}
            {!notification.read && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            )}

            {/* Icon Section */}
            <div className="flex-shrink-0 pt-0.5">
                {getIcon(notification.type || 'default')}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-0.5">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-neutral-400'}`}>
                        {notification.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-neutral-600 whitespace-nowrap">
                        {displayTime}
                    </span>
                </div>

                <p className="text-sm text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                    {notification.message}
                </p>

                {/* Action Area */}
                {(notification.actionLabel || !notification.read) && (
                    <div className="flex items-center gap-4 mt-1">
                        {notification.actionLabel && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.actionLink) {
                                        if (notification.actionLink.startsWith('/teacher/')) {
                                            const id = notification.actionLink.split('/').pop();
                                            window.location.hash = `teacher/${id}`;
                                        } else if (notification.actionLink.startsWith('/messages/')) {
                                            const id = notification.actionLink.split('/').pop();
                                            window.location.hash = `messages/${id}`;
                                        } else {
                                            router.push(notification.actionLink);
                                        }
                                    }
                                }}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors pl-0"
                            >
                                {notification.actionLabel}
                                <ArrowRight className="w-3 h-3" />
                            </button>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

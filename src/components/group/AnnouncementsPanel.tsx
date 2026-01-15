'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X as XIcon, ChevronRight } from 'lucide-react';
import { ChatConversation, ChatMessage } from '@/types/chat';
import { getAnnouncements } from '@/lib/groupManagementApi';

interface AnnouncementsPanelProps {
    conversation: ChatConversation;
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    onMessageClick?: (messageId: string) => void;
}

export default function AnnouncementsPanel({
    conversation,
    isOpen,
    onClose,
    currentUserId,
    onMessageClick,
}: AnnouncementsPanelProps) {
    const [announcements, setAnnouncements] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadAnnouncements();
        }
    }, [isOpen, conversation.id]);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await getAnnouncements(conversation.id);
            setAnnouncements(data as ChatMessage[]);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-[#1a1f2e]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Megaphone className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Announcements
                            </h2>
                            <p className="text-xs text-zinc-400">
                                {announcements.length} posted
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0f1419]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="w-8 h-8 text-zinc-600" />
                            </div>
                            <p className="text-lg font-medium text-zinc-300">No announcements yet</p>
                            <p className="text-sm mt-2 text-zinc-500">Important updates will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="bg-black/40 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group cursor-pointer relative"
                                    onClick={() => {
                                        onMessageClick?.(msg.id);
                                        onClose();
                                    }}
                                >

                                    <div className="p-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={msg.user?.avatarUrl || `https://ui-avatars.com/api/?name=${msg.user?.displayName}`}
                                                    alt={msg.user?.displayName}
                                                    className="w-9 h-9 rounded-full border border-zinc-700"
                                                />
                                                <div>
                                                    <div className="font-semibold text-white text-sm">
                                                        {msg.user?.displayName || 'Unknown Author'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-medium border border-amber-500/20">
                                                            ANNOUNCEMENT
                                                        </span>
                                                        <span className="text-xs text-zinc-500">
                                                            {formatTimestamp(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message Content */}
                                        <div className="text-zinc-300 text-sm whitespace-pre-wrap break-words leading-relaxed pl-12">
                                            {msg.content}
                                        </div>

                                        <div className="mt-3 pl-12 flex items-center justify-end">
                                            <span className="text-xs text-zinc-600 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                                Jump to message <ChevronRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

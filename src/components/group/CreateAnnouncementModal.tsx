'use client';

import { useState } from 'react';
import { X, Megaphone, Send } from 'lucide-react';
import { sendAnnouncement } from '@/lib/groupManagementApi';

interface CreateAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    onSuccess?: () => void;
}

export default function CreateAnnouncementModal({
    isOpen,
    onClose,
    conversationId,
    onSuccess
}: CreateAnnouncementModalProps) {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendAnnouncement(conversationId, content.trim());
            setContent('');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to send announcement:', error);
            const errorMessage = error.message || 'Failed to send announcement';
            if (errorMessage.includes('403')) {
                alert('You do not have permission to post announcements. Leaders and Moderators only.');
            } else {
                alert(errorMessage);
            }
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                            <Megaphone size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Make Announcement</h2>
                            <p className="text-xs text-zinc-500">Notify all group members</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What would you like to announce?"
                            className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white resize-none transition-all"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            Announcements will be pinned to the top of the chat for all members.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim() || isSending}
                            className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {!isSending ? (
                                <>
                                    <Send size={16} />
                                    <span>Post Announcement</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Posting...</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

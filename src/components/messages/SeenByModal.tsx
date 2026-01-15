'use client';

import { X } from 'lucide-react';

interface SeenByModalProps {
    isOpen: boolean;
    onClose: () => void;
    seenBy: Array<{
        userId: string;
        username?: string;
        displayName: string;
        avatarUrl?: string | null;
        seenAt: string;
    }>;
}

export default function SeenByModal({ isOpen, onClose, seenBy }: SeenByModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-white">Seen by</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {seenBy.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            No one has seen this yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {seenBy.map((user) => (
                                <div
                                    key={user.userId}
                                    className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-xl transition-colors"
                                >
                                    <img
                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName || user.username || 'User'}&background=random`}
                                        alt={user.displayName}
                                        className="w-10 h-10 rounded-full bg-zinc-800 object-cover border border-zinc-700"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {user.displayName || user.username || 'Unknown User'}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {new Date(user.seenAt).toLocaleString()}
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

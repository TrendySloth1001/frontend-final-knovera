import { useState, useEffect } from 'react';
import { X, Search, Send, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { discoverApi, ShareConversation } from '@/lib/discoverApi';
import { createPortal } from 'react-dom';

interface ShareToChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    sharedPostId?: string;
    sharedCommunityId?: string;
    previewTitle?: string;
    previewImage?: string;
}

export default function ShareToChatDrawer({
    isOpen,
    onClose,
    sharedPostId,
    sharedCommunityId,
    previewTitle,
    previewImage
}: ShareToChatDrawerProps) {
    const { token, user } = useAuth();
    const [conversations, setConversations] = useState<ShareConversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const [sentAppears, setSentAppears] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen && token && user?.user?.id) {
            loadConversations();
        }
    }, [isOpen, token, user]);

    const loadConversations = async () => {
        if (!token || !user?.user?.id) return;
        try {
            setLoading(true);
            const data = await discoverApi.getShareConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (conversationId: string) => {
        if (!token || !user?.user?.id || sendingTo) return;

        try {
            setSendingTo(conversationId);

            const contentType = sharedPostId ? 'POST' : 'COMMUNITY';
            const contentId = sharedPostId || sharedCommunityId;

            if (!contentId) {
                throw new Error('No content to share');
            }

            await discoverApi.shareContent({
                contentType: contentType as 'POST' | 'COMMUNITY',
                contentId,
                conversationId,
                // message: undefined // Let backend use default "Hey check this post"
            });

            setSentAppears(conversationId);
            setTimeout(() => {
                setSentAppears(null);
            }, 2000);

        } catch (error) {
            console.error('Failed to share', error);
        } finally {
            setSendingTo(null);
        }
    };

    const filteredConversations = conversations.filter(c => {
        return (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (!mounted) return null;
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative z-10 w-full max-w-md bg-neutral-900 h-full shadow-2xl pointer-events-auto transform transition-transform duration-300 flex flex-col border-l border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Share to...</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Preview Card */}
                <div className="p-4 bg-neutral-800/50 border-b border-white/5 mx-4 mt-4 rounded-xl flex gap-3 items-center">
                    {previewImage && (
                        <img src={previewImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover bg-neutral-800" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
                            {sharedPostId ? 'Sharing Post' : 'Sharing Community'}
                        </p>
                        <p className="text-sm font-bold text-white truncate">{previewTitle || 'Content'}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search conversation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conversation => {
                            const isSent = sentAppears === conversation.id;

                            return (
                                <div key={conversation.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                                            {conversation.avatarUrl ? (
                                                <img src={conversation.avatarUrl} alt={conversation.name || ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                                                    {(conversation.name?.[0] || '?').toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white text-sm">{conversation.name}</span>
                                            <span className="text-xs text-neutral-500">
                                                {conversation.isGroup ? `${conversation.memberCount} members` : 'Direct Message'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleShare(conversation.id)}
                                        disabled={!!sendingTo || isSent}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isSent
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                            : 'bg-white text-black hover:bg-neutral-200'
                                            }`}
                                    >
                                        {isSent ? (
                                            <span className="flex items-center gap-1"><Check size={12} /> Sent</span>
                                        ) : (
                                            sendingTo === conversation.id ? 'Sending...' : 'Send'
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-neutral-500 py-8 text-sm">No conversations found</div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Film, Music, Download } from 'lucide-react';
import MediaGrid from './MediaGrid';
import { messagesAPI } from '@/lib/messages';

export interface SharedMediaViewProps {
    conversationId: string;
    authToken: string;
    className?: string;
}

export default function SharedMediaView({ conversationId, authToken, className = '' }: SharedMediaViewProps) {
    const [activeTab, setActiveTab] = useState<'media' | 'files'>('media');
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (conversationId) {
            loadSharedMedia();
        }
    }, [conversationId]);

    const loadSharedMedia = async () => {
        setLoading(true);
        try {
            const data = await messagesAPI.getSharedMedia(authToken, conversationId);
            setMediaItems(data);
        } catch (error) {
            console.error('Failed to load shared media:', error);
        } finally {
            setLoading(false);
        }
    };

    // Flatten all media items from messages
    const allMedia = mediaItems.flatMap(msg => msg.media.map((m: any) => ({
        ...m,
        messageId: msg.messageId,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
    })));

    const imagesAndVideos = allMedia.filter(m => m.type.startsWith('image/') || m.type.startsWith('video/'));
    const documents = allMedia.filter(m => !m.type.startsWith('image/') && !m.type.startsWith('video/'));

    return (
        <div className={`flex flex-col h-full bg-transparent ${className}`}>
            {/* Tabs */}
            <div className="flex border-b border-zinc-800 shrink-0 px-4 pt-2">
                <button
                    onClick={() => setActiveTab('media')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'media' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Media ({imagesAndVideos.length})
                    {activeTab === 'media' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'files' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Files ({documents.length})
                    {activeTab === 'files' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 content-container">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'media' && (
                            imagesAndVideos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    <MediaGrid
                                        mediaUrls={imagesAndVideos.map((m: any) => m.url)}
                                        mediaTypes={imagesAndVideos.map((m: any) => m.type)}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 min-h-[200px]">
                                    <ImageIcon size={48} className="opacity-20" />
                                    <p>No photos or videos shared</p>
                                </div>
                            )
                        )}

                        {activeTab === 'files' && (
                            documents.length > 0 ? (
                                <div className="space-y-2">
                                    {documents.map((doc: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                                    {doc.type.startsWith('audio/') ? <Music size={20} /> : <FileText size={20} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {doc.url.split('/').pop()}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 truncate">
                                                        {doc.senderName} • {new Date(doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                            >
                                                <Download size={20} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 min-h-[200px]">
                                    <FileText size={48} className="opacity-20" />
                                    <p>No files shared</p>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

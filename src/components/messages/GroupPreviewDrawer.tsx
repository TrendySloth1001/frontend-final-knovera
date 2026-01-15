'use client';

import { X, Users, UserPlus, Check, Lock, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createJoinRequest } from '@/lib/groupManagementApi';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ImageStack from './ImageStack';

interface GroupPreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    currentUserId: string;
    onJoinSuccess?: () => void;
}

export default function GroupPreviewDrawer({
    isOpen,
    onClose,
    groupId,
    currentUserId,
    onJoinSuccess
}: GroupPreviewDrawerProps) {
    const { token } = useAuth();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && groupId && token) {
            loadGroupInfo();
        }
    }, [isOpen, groupId, token, currentUserId]);

    const loadGroupInfo = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);
            // Fetch public group info
            const response = await apiClient.get<any>(`/api/chat/conversations/${groupId}/public`);
            setGroup(response);

            // Check membership if user is logged in
            if (currentUserId) {
                try {
                    const fullConversation = await apiClient.get<any>(`/api/chat/conversations/${groupId}?userId=${currentUserId}`);
                    const isAlreadyMember = fullConversation.members?.some((member: any) => member.userId === currentUserId);
                    setIsMember(isAlreadyMember);
                    if (fullConversation.members) {
                        setGroup((prev: any) => ({ ...prev, members: fullConversation.members, description: fullConversation.description }));
                    }
                } catch (memberCheckError) {
                    setIsMember(false);
                }
            }
        } catch (err: any) {
            console.error('Failed to load group info:', err);
            setError('Group not found');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!group) return;

        setJoining(true);
        try {
            await createJoinRequest(groupId, '');
            setJoined(true);
            onJoinSuccess?.();
        } catch (err: any) {
            console.error('Failed to join group:', err);
            if (err.message?.includes('already') || err.message?.includes('Member')) {
                setJoined(true);
                onJoinSuccess?.();
            } else {
                alert(err.message || 'Failed to join group');
            }
        } finally {
            setJoining(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-l border-zinc-800 z-[61] flex flex-col shadow-2xl transition-transform duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-800/50 bg-[#0a0a0a] flex items-center justify-between">
                    <h2 className="text-zinc-400 font-medium text-sm uppercase tracking-widest">Group Preview</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                    </div>
                ) : error || !group ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <Users size={32} />
                        <p>Group not found</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400 overflow-hidden mb-4 shadow-2xl">
                                {group.avatarUrl || group.groupAvatar ? (
                                    <img
                                        src={group.avatarUrl || group.groupAvatar}
                                        alt={group.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    group.name ? group.name.substring(0, 1).toUpperCase() : 'G'
                                )}
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2">{group.name}</h1>

                            <div className="flex items-center justify-center gap-2 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                                    <Users size={12} className="text-zinc-400" />
                                    <span className="text-xs text-zinc-300 font-medium">{group.memberCount} members</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                                    {group.isPublic ? <Globe size={12} className="text-blue-400" /> : <Lock size={12} className="text-amber-400" />}
                                    <span className="text-xs text-zinc-300 font-medium">{group.isPublic ? 'Public' : 'Private'}</span>
                                </div>
                            </div>

                            {group.description && (
                                <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-sm">
                                    {group.description}
                                </p>
                            )}

                            {/* Members Stack */}
                            <div className="w-full bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50 mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-white">Members</span>
                                </div>
                                <div className="flex items-center">
                                    <ImageStack
                                        images={group.members?.map((m: any) => m.user?.avatarUrl).filter(Boolean) || (group.creator?.avatarUrl ? [group.creator.avatarUrl] : [])}
                                        totalCount={group.memberCount}
                                        size={40}
                                        limit={5}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                {!loading && !error && group && (
                    <div className="p-6 border-t border-zinc-800 bg-[#0a0a0a]">
                        {isMember ? (
                            <button
                                disabled
                                className="w-full py-3.5 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center gap-2 cursor-default"
                            >
                                <Check size={18} className="text-zinc-400" />
                                <span className="font-semibold text-zinc-400">Already Joined</span>
                            </button>
                        ) : joined ? (
                            <button
                                disabled
                                className="w-full py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 cursor-default"
                            >
                                <Check size={18} className="text-green-500" />
                                <span className="font-semibold text-green-500">Request Sent</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {joining ? (
                                    'Joining...'
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Join Group
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

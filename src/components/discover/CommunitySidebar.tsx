'use client';

import { useUserCommunities } from '@/hooks/useDiscover';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Flame, Compass } from 'lucide-react';

interface CommunitySidebarProps {
    onCommunityClick: (communityId: string) => void;
    onSeeAllClick: () => void;
}

export default function CommunitySidebar({ onCommunityClick, onSeeAllClick }: CommunitySidebarProps) {
    const { user } = useAuth();
    const { communities, loading } = useUserCommunities(user?.user?.id);

    // Mock trending data since we don't have an endpoint for it yet
    const trendingTopics = [
        { name: 'WebDevelopment', posts: '1.2k' },
        { name: 'OpenAI_o3', posts: '854' },
        { name: 'ReactJS', posts: '620' },
        { name: 'UI/UX', posts: '450' }
    ];

    const getGradient = (name: string) => {
        // Simple improved hashing for gradient selection based on name
        const gradients = [
            'from-purple-600 to-blue-500',
            'from-orange-400 to-red-600',
            'from-green-400 to-teal-600',
            'from-pink-500 to-purple-800',
            'from-blue-400 to-indigo-600',
            'from-yellow-400 to-orange-500'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return gradients[Math.abs(hash) % gradients.length];
    };

    const getInitials = (name: string) => {
        const parts = name.split(/[\s_-]+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <aside className="hidden lg:flex flex-col gap-4 w-80 shrink-0 sticky top-24 self-start">
            {/* Your Communities Card */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-white">Your Communities</h3>
                    <button
                        onClick={onSeeAllClick}
                        className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-bold transition-colors"
                    >
                        See All
                    </button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-neutral-900" />
                                    <div className="flex-1">
                                        <div className="h-3 w-24 bg-neutral-900 rounded mb-1" />
                                        <div className="h-2 w-12 bg-neutral-900 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : communities.length > 0 ? (
                        communities.slice(0, 5).map(community => (
                            <div
                                key={community.id}
                                onClick={() => onCommunityClick(community.id)}
                                className="flex items-center justify-between group cursor-pointer p-1 rounded-xl transition-all hover:bg-neutral-900"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(community.name)} flex items-center justify-center shadow-lg`}>
                                        <span className="text-xs font-black text-white">{getInitials(community.name)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{community.name}</p>
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{community.memberCount} Members</p>
                                    </div>
                                </div>
                                {/* Optional Status Dot - mocked for now or could be 'has new posts' */}
                                {/* <div className="w-2 h-2 rounded-full bg-green-500"></div> */}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-neutral-500 text-sm mb-2">You haven't joined any communities yet.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onSeeAllClick} // Or open create modal / explore
                    className="w-full mt-6 py-2.5 rounded-xl bg-neutral-900 text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all border border-transparent hover:border-neutral-700 flex items-center justify-center gap-2"
                >
                    <Compass size={16} />
                    Find New Communities
                </button>
            </div>

            {/* Trending Card */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-xs text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" />
                    Trending Now
                </h3>
                <div className="space-y-4">
                    {trendingTopics.map((topic, i) => (
                        <div key={i} className="flex flex-col cursor-pointer group hover:bg-neutral-900/50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">#{topic.name}</span>
                            <span className="text-[10px] font-medium text-neutral-500">{topic.posts} posts today</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

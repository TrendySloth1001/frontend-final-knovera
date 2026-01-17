'use client';

import { useState, useEffect } from 'react';
import { useUserCommunities } from '@/hooks/useDiscover';
import { useAuth } from '@/contexts/AuthContext';
import { discoverApi, TrendingTag, PopularAuthor, LeaderboardEntry } from '@/lib/discoverApi';
import { teacherApi } from '@/lib/api';
import { Flame, Compass, Trophy, TrendingUp, User, Check } from 'lucide-react';

interface CommunitySidebarProps {
    onCommunityClick: (communityId: string) => void;
    onSeeAllClick: () => void;
    onTopicClick: (tag: string) => void;
}

export default function CommunitySidebar({ onCommunityClick, onSeeAllClick, onTopicClick }: CommunitySidebarProps) {
    const { user } = useAuth();
    const { communities, loading: communitiesLoading } = useUserCommunities(user?.user?.id);

    // Analytics State
    const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [popularAuthors, setPopularAuthors] = useState<PopularAuthor[]>([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [tagsData, leaderboardData, authorsData] = await Promise.all([
                    discoverApi.getTrendingTags(5),
                    discoverApi.getLeaderboard('engagement', 'week', 3),
                    discoverApi.getPopularAuthors(3)
                ]);
                setTrendingTags(tagsData);
                setLeaderboard(leaderboardData);
                setPopularAuthors(authorsData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        fetchAnalytics();
    }, []);

    const handleFollow = async (teacherId: string) => {
        if (!teacherId) {
            console.error('No teacher ID provided');
            return;
        }

        try {
            // Find the author to check current follow status
            const author = popularAuthors.find(a => a.user.teacherId === teacherId);
            if (!author) return;

            if (author.isFollowing) {
                await teacherApi.unfollow(teacherId);
            } else {
                await teacherApi.follow(teacherId);
            }

            // Update local state
            setPopularAuthors(prev => prev.map(a =>
                a.user.teacherId === teacherId
                    ? { ...a, isFollowing: !a.isFollowing }
                    : a
            ));

            // Dispatch event for global follow state sync
            window.dispatchEvent(new CustomEvent('teacherFollowUpdate', {
                detail: { teacherId, isFollowing: !author.isFollowing }
            }));
        } catch (error) {
            console.error('Failed to follow/unfollow user:', error);
        }
    };

    const getGradient = (name: string) => {
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
        <aside className="flex flex-col gap-3 sm:gap-4 w-full shrink-0 pb-4">
            {/* Your Communities Card - Responsive */}
            <div className="bg-black border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 sm:gap-2">
                        <Compass size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                        Your Communities
                    </h3>
                    <button
                        onClick={onSeeAllClick}
                        className="text-[9px] sm:text-[10px] text-neutral-500 hover:text-white uppercase tracking-wider font-bold transition-colors"
                    >
                        See All
                    </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                    {communitiesLoading ? (
                        <div className="space-y-2 sm:space-y-3 animate-pulse">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900" />
                                    <div className="flex-1">
                                        <div className="h-2 w-16 sm:w-20 bg-neutral-900 rounded mb-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : communities.length > 0 ? (
                        communities.slice(0, 4).map(community => (
                            <div
                                key={community.id}
                                onClick={() => onCommunityClick(community.id)}
                                className="flex items-center justify-between group cursor-pointer p-1 sm:p-1.5 -mx-1 sm:-mx-1.5 rounded-lg transition-all hover:bg-neutral-900"
                            >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${getGradient(community.name)} flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0`}>
                                        {community.avatarUrl ? (
                                            <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[9px] sm:text-[10px] font-black text-white">{getInitials(community.name)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{community.name}</p>
                                        <p className="text-[8px] sm:text-[9px] text-neutral-500 font-bold uppercase tracking-wider">{community.memberCount} Members</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-neutral-500 text-xs">Join communities to see them here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Trending Tags Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm shrink-0">
                <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    Trending Topics
                </h3>
                {loadingAnalytics ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-8 bg-neutral-900 rounded" />
                        <div className="h-8 bg-neutral-900 rounded" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {trendingTags.map((tag) => (
                            <div
                                key={tag.tag}
                                onClick={() => onTopicClick(tag.tag)}
                                className="group cursor-pointer"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-neutral-300 group-hover:text-blue-400 transition-colors">#{tag.tag}</span>
                                    <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                                        {tag.postCount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Creators Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm shrink-0">
                <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    Top Creators
                </h3>
                {loadingAnalytics ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 bg-neutral-900 rounded" />
                        <div className="h-10 bg-neutral-900 rounded" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaderboard.map((entry) => (
                            <div key={entry.user.id} className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                                        {entry.user.avatarUrl ? (
                                            <img src={entry.user.avatarUrl} alt={entry.user.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs font-bold">
                                                {entry.user.displayName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-yellow-500 text-black text-[9px] font-bold flex items-center justify-center border border-black">
                                        {entry.rank}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate group-hover:text-yellow-500 transition-colors">
                                        {entry.user.displayName}
                                    </h4>
                                    <p className="text-[10px] text-neutral-500">
                                        {entry.score} pts
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Who to Follow Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm shrink-0">
                <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                    <User size={16} className="text-purple-500" />
                    Who to Follow
                </h3>
                {loadingAnalytics ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 bg-neutral-900 rounded" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {popularAuthors.map((author) => (
                            <div key={author.user.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800 shrink-0">
                                    {author.user.avatarUrl ? (
                                        <img src={author.user.avatarUrl} alt={author.user.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs font-bold">
                                            {author.user.displayName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate">
                                        {author.user.displayName}
                                    </h4>
                                    <p className="text-[10px] text-neutral-500 truncate">
                                        {author.stats.posts} posts
                                    </p>
                                </div>
                                <button
                                    onClick={() => author.user.teacherId && handleFollow(author.user.teacherId)}
                                    disabled={!author.user.teacherId}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1 ${!author.user.teacherId
                                            ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                            : author.isFollowing
                                                ? 'bg-green-500 text-black hover:bg-green-600'
                                                : 'bg-white text-black hover:bg-neutral-200'
                                        }`}
                                >
                                    {author.isFollowing ? (
                                        <>
                                            <Check size={10} /> Following
                                        </>
                                    ) : 'Follow'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-600 px-2 pb-8">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Cookies</a>
                <span>© 2026 Knover</span>
            </div>
        </aside>
    );
}

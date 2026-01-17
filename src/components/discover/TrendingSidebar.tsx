import React, { useEffect, useState } from 'react';
import { discoverApi, TrendingTag, PopularAuthor, LeaderboardEntry } from '@/lib/discoverApi';
import { Hash, User, TrendingUp, Trophy, ChevronRight, Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

export default function TrendingSidebar() {
    const { user } = useAuth();
    const [tags, setTags] = useState<TrendingTag[]>([]);
    const [authors, setAuthors] = useState<PopularAuthor[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tagsData, authorsData, leaderboardData] = await Promise.all([
                    discoverApi.getTrendingTags(5),
                    discoverApi.getPopularAuthors(10), // Fetch more to ensure we have enough after filtering
                    discoverApi.getLeaderboard('engagement', 'week', 10)
                ]);

                setTags(tagsData);

                // Filter out current user
                const currentUserId = user?.user?.id;

                const filteredAuthors = currentUserId
                    ? authorsData.filter(a => a.user.id !== currentUserId)
                    : authorsData;

                const filteredLeaderboard = currentUserId
                    ? leaderboardData.filter(e => e.user.id !== currentUserId)
                    : leaderboardData;

                setAuthors(filteredAuthors.slice(0, 3));
                setLeaderboard(filteredLeaderboard.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch trending data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.user?.id]);

    if (loading) {
        return (
            <div className="w-80 hidden lg:block p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-40 bg-neutral-900 rounded-2xl" />
                    <div className="h-60 bg-neutral-900 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 hidden lg:block space-y-6">
            {/* Trending Tags Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    Trending Topics
                </h3>
                <div className="space-y-3">
                    {tags.map((tag) => (
                        <div key={tag.tag} className="group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <span className="text-neutral-300 font-bold group-hover:text-blue-400 transition-colors">#{tag.tag}</span>
                                <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                                    {tag.postCount} posts
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                                {tag.totalVotes} likes • {tag.totalComments} comments
                            </p>
                        </div>
                    ))}
                    {tags.length === 0 && <p className="text-neutral-500 text-sm">No trending topics yet.</p>}
                </div>
                <button className="w-full mt-4 py-2 text-xs font-bold text-neutral-500 hover:text-white transition-colors border-t border-neutral-900">
                    View All Topics
                </button>
            </div>

            {/* Top Creators Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    Top Creators
                </h3>
                <div className="space-y-4">
                    {leaderboard.map((entry) => (
                        <div key={entry.user.id} className="flex items-center gap-3 group cursor-pointer">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                                    {entry.user.avatarUrl ? (
                                        <img src={entry.user.avatarUrl} alt={entry.user.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                                            {entry.user.displayName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center border border-black">
                                    {entry.rank}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-yellow-500 transition-colors">
                                    {entry.user.displayName}
                                </h4>
                                <p className="text-xs text-neutral-500">
                                    {entry.score} pts
                                </p>
                            </div>
                        </div>
                    ))}
                    {leaderboard.length === 0 && <p className="text-neutral-500 text-sm">No data available.</p>}
                </div>
            </div>

            {/* Who to Follow Widget */}
            <div className="bg-black border border-neutral-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <User size={18} className="text-purple-500" />
                    Who to Follow
                </h3>
                <div className="space-y-4">
                    {authors.map((author) => (
                        <div key={author.user.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800 flex-shrink-0">
                                {author.user.avatarUrl ? (
                                    <img src={author.user.avatarUrl} alt={author.user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                                        {author.user.displayName[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">
                                    {author.user.displayName}
                                </h4>
                                <p className="text-xs text-neutral-500 truncate">
                                    {author.stats.posts} posts • {author.stats.votes} votes
                                </p>
                            </div>
                            <button className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 transition-colors">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-600 px-2">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Advertising</a>
                <a href="#" className="hover:underline">Cookies</a>
                <span>© 2026 Knover Inc.</span>
            </div>
        </div>
    );
}

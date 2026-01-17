import { useState } from 'react';
import { useCommunities } from '@/hooks/useDiscover';
import CommunityCard from '@/components/discover/CommunityCard';
import { Search, Flame, Sparkles, SortAsc } from 'lucide-react';

interface CommunityListProps {
    onNavigate: (view: string, params?: any) => void;
}

export default function CommunityList({ onNavigate }: CommunityListProps) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'popular' | 'new' | 'name'>('popular');
    const { communities, loading, error, hasMore, loadMore, refresh } = useCommunities({ search, sortBy });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="mb-8">
                {/* Search & Sort Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search communities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-white focus:border-white transition-all text-sm font-medium text-white placeholder:text-neutral-600"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`px-4 py-2.5 rounded-xl capitalize transition-all font-bold text-sm flex items-center gap-2 ${sortBy === 'popular'
                                ? 'bg-white text-black'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                                }`}
                        >
                            <Flame size={16} className={sortBy === 'popular' ? 'text-orange-500' : ''} />
                            Popular
                        </button>
                        <button
                            onClick={() => setSortBy('new')}
                            className={`px-4 py-2.5 rounded-xl capitalize transition-all font-bold text-sm flex items-center gap-2 ${sortBy === 'new'
                                ? 'bg-white text-black'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                                }`}
                        >
                            <Sparkles size={16} className={sortBy === 'new' ? 'text-yellow-500' : ''} />
                            New
                        </button>
                        <button
                            onClick={() => setSortBy('name')}
                            className={`px-4 py-2.5 rounded-xl capitalize transition-all font-bold text-sm flex items-center gap-2 ${sortBy === 'name'
                                ? 'bg-white text-black'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                                }`}
                        >
                            <SortAsc size={16} className={sortBy === 'name' ? 'text-blue-500' : ''} />
                            A-Z
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-4 font-medium">
                    {error}
                </div>
            )}

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((community) => (
                    <div key={community.id} onClick={() => onNavigate('detail', { id: community.id })}>
                        <CommunityCard community={community} onUpdate={refresh} />
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}

            {/* Load More */}
            {!loading && hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-4 rounded-xl font-bold border border-neutral-800 shadow-sm mt-8 transition-all"
                >
                    Load More Communities
                </button>
            )}

            {/* Empty State */}
            {!loading && communities.length === 0 && (
                <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-800">
                    <div className="text-6xl mb-4 text-neutral-700">🏘️</div>
                    <p className="text-xl font-bold text-white mb-2">No communities found</p>
                    <p className="text-neutral-500">Try a different search or create a new community</p>
                </div>
            )}
        </div>
    );
}

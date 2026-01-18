
import { useState, useEffect } from 'react';
import { useCommunities } from '@/hooks/useDiscover';
import CommunityCard from '@/components/discover/CommunityCard';
import { Search, Flame, Sparkles, SortAsc, Users, ChevronRight, XCircle } from 'lucide-react';

/* 
  Simulated Loading Skeleton 
  Based on user's new design
*/
const CommunitySkeleton = () => (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-800 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-neutral-800 rounded w-1/2" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-neutral-800 rounded w-full" />
            <div className="h-3 bg-neutral-800 rounded w-5/6" />
        </div>
        <div className="flex gap-2 pt-2">
            <div className="h-8 bg-neutral-800 rounded-lg w-20" />
            <div className="h-8 bg-neutral-800 rounded-lg w-20" />
        </div>
    </div>
);

interface CommunityListProps {
    onNavigate: (view: string, params?: any) => void;
}

export default function CommunityList({ onNavigate }: CommunityListProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<'popular' | 'new' | 'name'>('popular');

    // Handle Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Use existing hook with debounced search
    const { communities, loading, error, hasMore, loadMore, refresh } = useCommunities({
        search: debouncedSearch,
        sortBy
    });

    const clearSearch = () => setSearch('');

    const sortOptions = [
        { id: 'popular', label: 'Popular', icon: Flame, color: 'text-orange-500' },
        { id: 'new', label: 'New', icon: Sparkles, color: 'text-yellow-400' },
        { id: 'name', label: 'A-Z', icon: SortAsc, color: 'text-blue-400' },
    ] as const;

    return (
<div className="max-w-6xl mx-auto mt-8 space-y-8">
            {/* Header Section */}
            <header className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                    Discover Communities
                </h1>
                <p className="text-neutral-500 max-w-2xl">
                    Find your tribe. Join thousands of users in specialized spaces for learning, creating, and growing together.
                </p>
            </header>

            {/* Control Bar */}
            <div className="sticky top-16 z-10 py-4 bg-black/80 backdrop-blur-md border-b border-neutral-900 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search input with clearing capability */}
                    <div className="relative flex-1 group">
                        <Search
                            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${search ? 'text-white' : 'text-neutral-600'}`}
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search by name or topic..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 bg-neutral-900/50 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-white/10 focus:border-neutral-600 transition-all text-base font-medium text-white placeholder:text-neutral-600 outline-none"
                        />
                        {search && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </div>

                    {/* Sort Tabs */}
                    <div className="flex p-1 bg-neutral-900/80 border border-neutral-800 rounded-2xl items-center overflow-x-auto no-scrollbar">
                        {sortOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = sortBy === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortBy(opt.id as any)}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${isActive
                                        ? 'bg-neutral-800 text-white shadow-lg'
                                        : 'text-neutral-500 hover:text-neutral-300'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? opt.color : 'text-neutral-600'} />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-medium">
                    Error loading communities: {error}
                </div>
            )}

            {/* Content Area */}
            {loading && communities.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => <CommunitySkeleton key={i} />)}
                </div>
            ) : communities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <div key={community.id} onClick={() => onNavigate('detail', { id: community.id })}>
                            <CommunityCard community={community} onUpdate={refresh} />
                        </div>
                    ))}
                </div>
            ) : (
                /* Enhanced Empty State */
                <div className="flex flex-col items-center justify-center py-32 bg-neutral-950 rounded-[40px] border-2 border-dashed border-neutral-900">
                    <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-neutral-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No results for "{search}"</h2>
                    <p className="text-neutral-500 mb-8 text-center max-w-sm">
                        We couldn't find any communities matching your search criteria. Try using different keywords.
                    </p>
                    <button
                        onClick={clearSearch}
                        className="px-8 py-3 bg-white text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Pagination / Load More */}
            {!loading && hasMore && (
                <div className="pt-8 pb-12 flex flex-col items-center gap-4">
                    <button
                        onClick={loadMore}
                        className="group relative px-12 py-4 bg-neutral-900 hover:bg-white hover:text-black text-white rounded-2xl font-bold border border-neutral-800 transition-all duration-300 overflow-hidden"
                    >
                        <span className="relative z-10">Load More Communities</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </button>
                </div>
            )}

            {/* Loading more spinner */}
            {loading && communities.length > 0 && (
                <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <CommunitySkeleton key={`more-${i}`} />)}
                </div>
            )}
        </div>
    );
}

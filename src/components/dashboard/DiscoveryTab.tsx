import { useState, useEffect } from 'react';
import { usePosts, useCommunities, useSavedPosts, useRecommendedPosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import CreatePostForm from '@/components/discover/CreatePostForm';
import CreateCommunityForm from '@/components/discover/CreateCommunityForm';
import CommunityList from './discovery/CommunityList';
import CommunityDetail from './discovery/CommunityDetail';
import PostDetail from './discovery/PostDetail';
import CommunitySidebar from '@/components/discover/CommunitySidebar';

import { Search, Plus, X, Compass, Users, Bookmark, Sparkles, Image as ImageIcon, Video, Link } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DiscoveryTab() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('feed');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;

            if (hash === '#discovery/communities') {
                setActiveTab('communities');
            } else if (hash === '#discovery/saved') {
                setActiveTab('saved');
            } else if (hash === '#discovery/recommended') {
                setActiveTab('recommended');
            } else if (hash.startsWith('#discovery/community/')) {
                const communityId = hash.replace('#discovery/community/', '');
                if (communityId) {
                    setActiveCommunityId(communityId);
                    setActiveTab('community_detail');
                } else {
                    setActiveTab('feed');
                }
            } else if (hash.startsWith('#discovery/topic/')) {
                const tag = hash.replace('#discovery/topic/', '');
                if (tag) {
                    setSelectedTag(tag);
                    setActiveTab('feed');
                }
            } else if (hash.startsWith('#discovery/post/')) {
                const postId = hash.replace('#discovery/post/', '');
                if (postId) {
                    setSelectedPostId(postId);
                    setActiveTab('feed'); // Or keep current tab context? Feed matches overlay best.
                }
            } else if (hash === '#discovery/feed' || hash === '' || hash === '#discovery') {
                setActiveTab('feed');
                setSelectedTag(null); // Clear tag selection when going to root feed
            } else if (hash.startsWith('#discovery/')) {
                // Fallback for other discovery routes
                setActiveTab('feed');
            }
        };

        // Initial check
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleTabChange = (tab: string, id?: string) => {
        if (tab === 'feed') {
            window.location.hash = 'discovery/feed';
            setSelectedTag(null);
        }
        if (tab === 'recommended') window.location.hash = 'discovery/recommended';
        if (tab === 'communities') window.location.hash = 'discovery/communities';
        if (tab === 'saved') window.location.hash = 'discovery/saved';
        if (tab === 'community_detail' && id) {
            window.location.hash = `discovery/community/${id}`;
        }
    };
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null); // State for selected tag
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateCommunity, setShowCreateCommunity] = useState(false);

    // Feed Data
    const { posts: feedPosts, loading: feedLoading, error: feedError, loadMore: loadMoreFeed, hasMore: hasMoreFeed } = usePosts({
        sortBy: 'hot',
        tags: selectedTag ? [selectedTag] : undefined // Filter by tag if selected
    });

    // Recommended Data
    const { posts: recPosts, loading: recLoading, error: recError, refresh: refreshRec } = useRecommendedPosts(20);

    // Saved Data
    const { posts: savedPosts, loading: savedLoading, error: savedError } = useSavedPosts();

    const handleCommunityClick = (communityId: string) => {
        handleTabChange('community_detail', communityId);
    };

    const handleTopicClick = (tag: string) => {
        // Remove # if present
        const cleanTag = tag.replace('#', '');
        window.location.hash = `discovery/topic/${cleanTag}`;
    };

    const renderContent = () => {
        if (activeTab === 'community_detail' && activeCommunityId) {
            return (
                <CommunityDetail
                    communityId={activeCommunityId}
                    onBack={() => handleTabChange('feed')}
                    onCreatePost={() => setShowCreatePost(true)}
                />
            );
        }

        switch (activeTab) {
            case 'communities':
                return <CommunityList onNavigate={(view, params) => {
                    if (view === 'detail' && params?.id) {
                        handleCommunityClick(params.id);
                    }
                }} />;

            case 'saved':
                return (
                    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-8 tracking-tight px-2">Your Saved Collection</h2>
                            {savedLoading ? (
                                <div className="text-center py-8 text-white">Loading...</div>
                            ) : savedPosts.length > 0 ? (
                                savedPosts.map(post => (
                                    <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer">
                                        <PostCard post={post} showCommunity={true} />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 sm:py-20 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl sm:rounded-3xl mx-2">
                                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Nothing saved yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'feed':
            case 'recommended':
            default:
                const isRecommended = activeTab === 'recommended';
                const currentPosts = isRecommended ? recPosts : feedPosts;
                const isLoading = isRecommended ? recLoading : feedLoading;

                return (
                    <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6">
                        <div className="flex flex-col xl:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 min-h-[50vh]">
                            {/* Feed Column - Responsive */}
                            <div className="w-full xl:flex-1 xl:max-w-3xl">
                                {/* Feed Title if viewing tag */}
                                {selectedTag && activeTab === 'feed' && (
                                    <div className="mb-4 sm:mb-6 flex items-center justify-between px-2">
                                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                            <span className="text-blue-500">#</span> {selectedTag}
                                        </h2>
                                        <button
                                            onClick={() => handleTabChange('feed')}
                                            className="text-xs font-bold text-neutral-400 hover:text-white bg-neutral-900 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}

                                {/* Inline Create Trigger - Hidden on Mobile */}
                                {!selectedTag && (
                                    <div onClick={() => setShowCreatePost(true)} className="hidden sm:block bg-black border border-neutral-800 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-8 shadow-sm cursor-pointer hover:border-neutral-700 transition-all group">
                                        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-700">
                                                {user?.user?.avatarUrl ? (
                                                    <img src={user.user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-bold text-sm">{user?.user?.displayName?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="w-full h-8 sm:h-10 flex items-center px-3 sm:px-4 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 font-medium text-sm group-hover:border-neutral-700 group-hover:bg-neutral-800 transition-all">
                                                    What's on your mind?
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pl-8 sm:pl-14">
                                            <div className="flex gap-2 sm:gap-4">
                                                <button className="flex items-center gap-1.5 sm:gap-2 text-neutral-500 hover:text-green-500 transition-colors text-xs sm:text-sm font-medium">
                                                    <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    <span className="hidden sm:inline">Media</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 sm:gap-2 text-neutral-500 hover:text-purple-500 transition-colors text-xs sm:text-sm font-medium">
                                                    <Video size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    <span className="hidden sm:inline">Video</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 sm:gap-2 text-neutral-500 hover:text-blue-500 transition-colors text-xs sm:text-sm font-medium">
                                                    <Link size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    <span className="hidden sm:inline">Link</span>
                                                </button>
                                            </div>
                                            <button className="bg-white text-black px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold hover:bg-neutral-200 transition-colors">
                                                Post
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Feed Posts - Responsive Spacing */}
                                {isLoading ? (
                                    <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
                                        {currentPosts.map(post => (
                                            <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer">
                                                <PostCard post={post} showCommunity={true} />
                                            </div>
                                        ))}
                                        {!isRecommended && hasMoreFeed && (
                                            <button onClick={loadMoreFeed} className="w-full py-3 sm:py-4 text-white text-sm font-bold hover:bg-neutral-900 rounded-xl transition-colors border border-neutral-800">
                                                Load More
                                            </button>
                                        )}
                                        {currentPosts.length === 0 && (
                                            <div className="text-center py-12 sm:py-20 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl sm:rounded-3xl mx-2">
                                                <p className="text-neutral-500 font-bold text-sm">
                                                    {selectedTag ? `No posts found for #${selectedTag}` : 'No posts yet.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar - Hidden on Mobile/Tablet, Visible on XL */}
                            <div className="hidden xl:block xl:w-80 2xl:w-96 flex-shrink-0">
                                <div className="sticky top-20">
                                    <CommunitySidebar
                                        onCommunityClick={handleCommunityClick}
                                        onSeeAllClick={() => handleTabChange('communities')}
                                        onTopicClick={handleTopicClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans text-white">
            {/* Top Navbar */}
            <header className="h-16 border-b border-white/10 sticky top-0 z-30 bg-black/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-8 overflow-hidden">
                    {/* <h1 className="text-xl font-bold tracking-tight">Discovery</h1> -- Removed as per user request */}

                    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear-fade pb-1 sm:pb-0">
                        <button
                            onClick={() => handleTabChange('feed')}
                            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Feed
                        </button>
                        <button
                            onClick={() => handleTabChange('recommended')}
                            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'recommended' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Sparkles size={14} className={activeTab === 'recommended' ? 'text-yellow-500' : ''} />
                            For You
                        </button>
                        <button
                            onClick={() => handleTabChange('communities')}
                            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'communities' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Communities
                        </button>
                        <button
                            onClick={() => handleTabChange('saved')}
                            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'saved' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Saved
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 pl-10 pr-4 py-2 bg-black border border-neutral-800 rounded-full focus:ring-1 focus:ring-white focus:border-white transition-all text-sm font-medium text-white placeholder:text-neutral-600"
                        />
                    </div>

                    <button
                        onClick={() => setShowCreateCommunity(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-black border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        <Plus size={14} /> Community
                    </button>
                    <button onClick={() => setShowCreatePost(true)} className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-neutral-200 transition-all shadow-sm active:scale-95">
                        Create Post
                    </button>
                </div>
            </header>

            {/* Content - Responsive Grid Layout */}
            <div className="w-full">
                <div className="max-w-[1920px] mx-auto">
                    {renderContent()}
                </div>
            </div>

            {/* --- Overlays --- */}

            {/* Post Detail Overlay - Responsive */}
            {selectedPostId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="bg-black border-0 sm:border border-white/10 w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-white/10">
                            <h2 className="text-base sm:text-lg font-bold text-white sm:hidden">Post Details</h2>
                            <button onClick={() => setSelectedPostId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white ml-auto"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Create Post Modal - Responsive */}
            {showCreatePost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="bg-neutral-900 border-0 sm:border border-white/10 w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-black text-white">Create Post</h2>
                            <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={20} /></button>
                        </div>
                        <CreatePostForm
                            onSuccess={() => { setShowCreatePost(false); loadMoreFeed(); }}
                            onCancel={() => setShowCreatePost(false)}
                        />
                    </div>
                </div>
            )}

            {/* Create Community Modal - Responsive */}
            {showCreateCommunity && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
                    <div className="bg-neutral-900 border-0 sm:border border-white/10 w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] sm:rounded-3xl shadow-2xl p-4 sm:p-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-black text-white">Create Community</h2>
                            <button onClick={() => setShowCreateCommunity(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={20} /></button>
                        </div>
                        <CreateCommunityForm
                            onSuccess={() => { setShowCreateCommunity(false); }}
                            onCancel={() => setShowCreateCommunity(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
}

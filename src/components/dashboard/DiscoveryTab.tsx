import { useState, useEffect } from 'react';
import { usePosts, useCommunities, useSavedPosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import CreatePostForm from '@/components/discover/CreatePostForm';
import CreateCommunityForm from '@/components/discover/CreateCommunityForm';
import CommunityList from './discovery/CommunityList';
import CommunityDetail from './discovery/CommunityDetail';
import PostDetail from './discovery/PostDetail';
import CommunitySidebar from '@/components/discover/CommunitySidebar';

import { Search, Plus, X, Compass, Users, Bookmark } from 'lucide-react';

export default function DiscoveryTab() {
    const [activeTab, setActiveTab] = useState('feed');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateCommunity, setShowCreateCommunity] = useState(false);

    // Feed Data
    const { posts: feedPosts, loading: feedLoading, error: feedError, loadMore: loadMoreFeed, hasMore: hasMoreFeed } = usePosts({ sortBy: 'hot' });

    // Saved Data
    const { posts: savedPosts, loading: savedLoading, error: savedError } = useSavedPosts();

    const handleCommunityClick = (communityId: string) => {
        setActiveCommunityId(communityId);
        setActiveTab('community_detail');
    };

    const renderContent = () => {
        if (activeTab === 'community_detail' && activeCommunityId) {
            return <CommunityDetail communityId={activeCommunityId} onBack={() => setActiveTab('feed')} />;
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
                    <div className="max-w-4xl mx-auto space-y-4">
                        <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Your Saved Collection</h2>
                        {savedLoading ? (
                            <div className="text-center py-8 text-white">Loading...</div>
                        ) : savedPosts.length > 0 ? (
                            savedPosts.map(post => (
                                <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer">
                                    <PostCard post={post} showCommunity={true} />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-3xl">
                                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Nothing saved yet</p>
                            </div>
                        )}
                    </div>
                );

            case 'feed':
            default:
                return (
                    <div className="flex justify-center gap-8">
                        {/* Feed Column */}
                        <div className="flex-1 max-w-2xl">
                            {/* Inline Create Trigger */}
                            <div onClick={() => setShowCreatePost(true)} className="bg-black border border-neutral-800 rounded-2xl p-4 mb-8 shadow-sm cursor-pointer hover:border-neutral-600 transition-colors">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 border border-neutral-800 text-neutral-400 font-bold">U</div>
                                    <div className="flex-1">
                                        <input readOnly placeholder="What's on your mind?" className="w-full text-lg font-bold placeholder:text-neutral-600 focus:outline-none bg-transparent cursor-pointer text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                                    <div className="flex gap-2">
                                        <span className="p-2 text-neutral-400 bg-neutral-800 rounded-lg text-sm font-medium">🖼️ Media</span>
                                    </div>
                                    <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">Create Post</button>
                                </div>
                            </div>

                            {/* Feed Posts */}
                            {feedLoading ? (
                                <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
                            ) : (
                                <div className="space-y-4">
                                    {feedPosts.map(post => (
                                        <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer">
                                            <PostCard post={post} showCommunity={true} />
                                        </div>
                                    ))}
                                    {hasMoreFeed && (
                                        <button onClick={loadMoreFeed} className="w-full py-4 text-white font-bold hover:bg-neutral-900 rounded-xl transition-colors border border-neutral-800">
                                            Load More
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar */}
                        <CommunitySidebar
                            onCommunityClick={handleCommunityClick}
                            onSeeAllClick={() => setActiveTab('communities')}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans text-white">
            {/* Top Navbar */}
            <header className="h-16 border-b border-white/10 sticky top-0 z-30 bg-black/80 backdrop-blur-md px-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* <h1 className="text-xl font-bold tracking-tight">Discovery</h1> -- Removed as per user request */}

                    <nav className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Feed
                        </button>
                        <button
                            onClick={() => setActiveTab('communities')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'communities' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Communities
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
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

            {/* Content */}
            <div className="p-6 md:p-8 w-full">
                {renderContent()}
            </div>

            {/* --- Overlays --- */}

            {/* Post Detail Overlay */}
            {selectedPostId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-end p-4 border-b border-white/10">
                            <button onClick={() => setSelectedPostId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Create Post Modal */}
            {showCreatePost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white">Create Post</h2>
                            <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X size={20} /></button>
                        </div>
                        <CreatePostForm
                            onSuccess={() => { setShowCreatePost(false); loadMoreFeed(); }}
                            onCancel={() => setShowCreatePost(false)}
                        />
                    </div>
                </div>
            )}

            {/* Create Community Modal */}
            {showCreateCommunity && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white">Create Community</h2>
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

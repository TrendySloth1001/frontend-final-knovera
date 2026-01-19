import { useState, useRef } from 'react';
import { useCommunity, usePosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import { getAuthToken } from '@/lib/api';
import { discoverApi } from '@/lib/discoverApi';
import ShareToChatDrawer from '@/components/discover/ShareToChatDrawer';
import {
    Camera,
    Image as ImageIcon,
    Settings,
    Bell,
    Trophy,
    ArrowLeft,
    Info,
    Users,
    X,
    Share2,
    Save
} from 'lucide-react';

interface CommunityDetailProps {
    communityId: string;
    onBack: () => void;
    onCreatePost: () => void;
}

export default function CommunityDetail({ communityId, onBack, onCreatePost }: CommunityDetailProps) {
    const { community, loading: communityLoading, joinCommunity, leaveCommunity, refresh: refreshCommunity } = useCommunity(communityId);
    const { posts, loading: postsLoading, refresh: refreshPosts } = usePosts({ communityId });
    const [isjoining, setIsJoining] = useState(false);
    const [activeTab, setActiveTab] = useState<'Posts' | 'About'>('Posts');
    const [isUploading, setIsUploading] = useState<{ type: 'avatar' | 'banner' | null; status: boolean }>({ type: null, status: false });
    const [showEditDrawer, setShowEditDrawer] = useState(false);
    const [showShareDrawer, setShowShareDrawer] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', rules: '' });
    const isAuthenticated = !!getAuthToken();

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleJoinToggle = async () => {
        if (!isAuthenticated) return;
        try {
            setIsJoining(true);
            if (community?.isMember) {
                await leaveCommunity();
            } else {
                await joinCommunity();
            }
        } catch (error) {
            console.error('Failed to toggle membership:', error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        try {
            setIsUploading({ type, status: true });
            if (type === 'avatar') {
                await discoverApi.uploadCommunityAvatar(communityId, file);
            } else {
                await discoverApi.uploadCommunityBackground(communityId, file);
            }
            await refreshCommunity();
        } catch (error) {
            console.error(`Failed to upload ${type}:`, error);
            alert(`Failed to upload ${type}`);
        } finally {
            setIsUploading({ type: null, status: false });
        }
    };

    if (communityLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="text-center py-20">
                <button onClick={onBack} className="mb-4 text-white hover:underline flex items-center justify-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Back
                </button>
                <p className="text-xl text-neutral-500">Community not found</p>
            </div>
        );
    }

    // Determine if user can edit (creator or moderator)
    const canEdit = community.userRole === 'CREATOR' || community.userRole === 'MODERATOR';

    const openEditDrawer = () => {
        setEditForm({
            name: community?.name || '',
            description: community?.description || '',
            rules: community?.rules || ''
        });
        setShowEditDrawer(true);
    };

    const handleUpdateCommunity = async () => {
        try {
            await discoverApi.updateCommunity(communityId, editForm);
            await refreshCommunity();
            setShowEditDrawer(false);
        } catch (error) {
            console.error('Failed to update community:', error);
            alert('Failed to update community');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Share Drawer */}
            <ShareToChatDrawer
                isOpen={showShareDrawer}
                onClose={() => setShowShareDrawer(false)}
                sharedCommunityId={community.id}
                previewTitle={community.name}
                previewImage={community.avatarUrl}
            />

            {/* Nav / Back Button */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={18} /> Back to Feed
                </button>
                <button
                    onClick={() => setShowShareDrawer(true)}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <Share2 size={18} /> Share
                </button>
            </div>

            {/* Header Section */}
            <div className="relative group mb-8">
                {/* ... (Banner code same as before) ... */}
                <div className="h-48 md:h-72 w-full bg-neutral-900 rounded-3xl overflow-hidden relative border border-neutral-800">
                    {community.bannerUrl ? (
                        <img
                            src={community.bannerUrl}
                            alt={community.name}
                            className="w-full h-full object-cover opacity-80"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
                    )}

                    {/* Banner Upload Overlay */}
                    {canEdit && (
                        <div
                            onClick={() => bannerInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                        >
                            <div className="flex flex-col items-center">
                                <ImageIcon className="text-white mb-2" size={32} />
                                <span className="text-sm font-bold text-white">Update Cover Photo</span>
                            </div>
                        </div>
                    )}

                    {isUploading.type === 'banner' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>
                <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />

                {/* Avatar Container with Backdrop */}
                <div className="absolute -bottom-6 left-6 md:left-12 flex items-end gap-6 z-20">
                    {/* ... (Avatar code same as before) ... */}
                    <div className="relative group/avatar">
                        <div className="w-24 h-24 md:w-36 md:h-36 rounded-3xl border-4 border-black bg-neutral-900 overflow-hidden shadow-2xl relative">
                            {community.avatarUrl ? (
                                <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 font-bold text-4xl">
                                    {community.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}

                            {isUploading.type === 'avatar' && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}

                            {canEdit && (
                                <div
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-20 backdrop-blur-[2px]"
                                >
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </div>

                    {/* Community Info */}
                    <div className="mb-4 pb-2 md:pb-0 relative">
                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                                {community.name}
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-blue-500/30 font-bold">Community</span>
                            </h1>
                            <p className="text-white/90 text-sm font-bold mt-1 flex items-center gap-2">
                                <Users size={14} className="text-neutral-400" />
                                {community.memberCount.toLocaleString()} Members
                            </p>

                            {/* Mutuals */}
                            {community.mutualMembers && community.mutualMembers.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex -space-x-2">
                                        {community.mutualMembers.slice(0, 3).map((member) => (
                                            <div key={member.id} className="w-6 h-6 rounded-full border-2 border-black/60 bg-neutral-700 overflow-hidden" title={member.displayName}>
                                                {member.avatarUrl ? (
                                                    <img src={member.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white">
                                                        {member.displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-white/70">
                                        {community.mutualMembers.length === 1
                                            ? <><span className="text-white font-medium">{community.mutualMembers[0].displayName.split(' ')[0]}</span> is here too 👋</>
                                            : community.mutualMembers.length === 2
                                                ? <><span className="text-white font-medium">{community.mutualMembers[0].displayName.split(' ')[0]}</span> & <span className="text-white font-medium">{community.mutualMembers[1].displayName.split(' ')[0]}</span> are in this ✨</>
                                                : <><span className="text-white font-medium">{community.mutualMembers[0].displayName.split(' ')[0]}</span>, <span className="text-white font-medium">{community.mutualMembers[1].displayName.split(' ')[0]}</span> + more are here 🔥</>
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Actions Bar */}
            <div className="mt-12 px-2 md:px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex gap-1 bg-neutral-900/50 p-1 rounded-full border border-neutral-800">
                    {(['Posts', 'About'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-neutral-700 font-bold hover:bg-neutral-800 text-white transition-colors text-sm">
                        <Bell size={16} /> <span className="hidden sm:inline">Notifications</span>
                    </button>

                    {/* Join / Leave / Creator Button */}
                    {community.userRole === 'CREATOR' ? (
                        <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-bold bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-default text-sm">
                            Creator
                        </div>
                    ) : community.isMember ? (
                        <button
                            onClick={handleJoinToggle}
                            disabled={isjoining}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm bg-neutral-800 text-white border border-neutral-700 hover:bg-red-900/80 hover:text-red-200 hover:border-red-800 group"
                        >
                            {isjoining ? '...' : <><span className="group-hover:hidden">Joined</span><span className="hidden group-hover:inline">Leave</span></>}
                        </button>
                    ) : (
                        <button
                            onClick={handleJoinToggle}
                            disabled={isjoining}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
                        >
                            {isjoining ? '...' : 'Join Community'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {activeTab === 'Posts' ? (
                        <>
                            {/* Create Post Banner */}
                            {community.isMember && (
                                <div
                                    onClick={onCreatePost}
                                    className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 flex gap-4 items-center mb-6 cursor-pointer hover:bg-neutral-900 hover:border-neutral-700 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold border border-neutral-700">U</div>
                                    <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-500 text-sm font-medium group-hover:text-neutral-400 transition-colors">
                                        Create a new post in {community.name}...
                                    </div>
                                    <div className="p-2 rounded-full bg-neutral-800 text-neutral-400 group-hover:text-white transition-colors">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>
                            )}

                            {/* Posts List */}
                            {postsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            ) : posts.length > 0 ? (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <PostCard key={post.id} post={post} onPostUpdate={refreshPosts} showCommunity={false} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800 p-12 text-center">
                                    <p className="text-lg font-bold text-white mb-2">No posts yet</p>
                                    <p className="text-neutral-500">Be the first to share something with the community!</p>
                                    {community.isMember && (
                                        <button onClick={onCreatePost} className="mt-4 text-blue-400 hover:text-blue-300 font-bold text-sm">
                                            Create Post
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* About Tab Content */
                        <div className="bg-black rounded-3xl border border-neutral-800 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                                    <Info className="text-blue-500" /> About {community.name}
                                </h3>
                                <p className="text-neutral-300 leading-relaxed text-lg">
                                    {community.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-b border-neutral-800 py-6">
                                <div>
                                    <div className="text-3xl font-black text-white">{community.memberCount.toLocaleString()}</div>
                                    <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mt-1">Total Members</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white flex items-center gap-2">
                                        {community.postCount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-neutral-500 uppercase font-bold tracking-wider mt-1">Total Posts</div>
                                </div>
                            </div>

                            {community.rules && (
                                <div>
                                    <h4 className="font-bold text-sm text-neutral-400 uppercase tracking-widest mb-4">Community Rules</h4>
                                    <div className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800 whitespace-pre-line text-neutral-300 leading-relaxed">
                                        {community.rules}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-neutral-500 font-medium pt-4">
                                Created on {new Date(community.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <div className="bg-black rounded-3xl border border-neutral-800 overflow-hidden sticky top-24">
                        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-500">Community Info</h3>
                                {canEdit && (
                                    <button onClick={openEditDrawer} className="text-neutral-500 hover:text-white transition-colors">
                                        <Settings size={16} />
                                    </button>
                                )}
                            </div>

                            <p className="text-sm text-neutral-400 line-clamp-3 mb-6">
                                {community.description || "Welcome to our community!"}
                            </p>

                            {/* Action Button */}
                            {community.isMember ? (
                                <button
                                    onClick={onCreatePost}
                                    className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-neutral-200 transition-colors text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ImageIcon size={16} /> Create Post
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoinToggle}
                                    disabled={isjoining}
                                    className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-500 transition-colors text-sm shadow-lg active:scale-95"
                                >
                                    Join Community
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Drawer (Right Side) */}
            <div className={`fixed inset-0 z-50 pointer-events-none ${showEditDrawer ? '' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${showEditDrawer ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowEditDrawer(false)}
                />
                <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-2xl transform transition-transform duration-300 pointer-events-auto flex flex-col ${showEditDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xl font-black text-white">Community Settings</h2>
                        <button onClick={() => setShowEditDrawer(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Community Name</label>
                            <input
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Description</label>
                            <textarea
                                rows={4}
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-medium resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Rules</label>
                            <textarea
                                rows={6}
                                value={editForm.rules}
                                onChange={(e) => setEditForm(prev => ({ ...prev, rules: e.target.value }))}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-medium resize-none"
                                placeholder="One rule per line"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-neutral-900">
                        <button
                            onClick={handleUpdateCommunity}
                            className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-neutral-200 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

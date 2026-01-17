import { useState } from 'react';
import { useCommunity, usePosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import { getAuthToken } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

interface CommunityDetailProps {
    communityId: string;
    onBack: () => void;
}

export default function CommunityDetail({ communityId, onBack }: CommunityDetailProps) {
    const { community, loading: communityLoading, joinCommunity, leaveCommunity } = useCommunity(communityId);
    const { posts, loading: postsLoading, refresh } = usePosts({ communityId });
    const [isJoining, setIsJoining] = useState(false);
    const isAuthenticated = !!getAuthToken();

    const handleJoinToggle = async () => {
        if (!isAuthenticated) {
            alert('Please log in to join communities');
            return;
        }

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

    if (communityLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="text-center py-12">
                <button onClick={onBack} className="mb-4 text-white hover:underline">← Back</button>
                <p className="text-xl text-neutral-500">Community not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 font-medium"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Banner */}
            {community.bannerUrl && (
                <div className="h-64 bg-gradient-to-r from-neutral-800 to-neutral-900 relative rounded-t-3xl overflow-hidden border border-neutral-800 border-b-0">
                    <img
                        src={community.bannerUrl}
                        alt={community.name}
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>
            )}

            {/* Community Header */}
            <div className={`bg-neutral-900 border border-neutral-800 p-8 mb-8 ${community.bannerUrl ? 'rounded-b-3xl border-t-0' : 'rounded-3xl'}`}>
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Avatar */}
                    <div className="-mt-16 md:-mt-12 ml-4 md:ml-0 relative z-10">
                        {community.avatarUrl ? (
                            <img
                                src={community.avatarUrl}
                                alt={community.name}
                                className="w-24 h-24 rounded-3xl border-4 border-black shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-white text-black flex items-center justify-center text-4xl font-black border-4 border-black shadow-xl">
                                {community.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h1 className="text-4xl font-black mb-2 text-white tracking-tight">{community.name}</h1>
                                <div className="flex gap-4 text-sm font-bold text-neutral-400">
                                    <span>{community.memberCount.toLocaleString()} members</span>
                                    <span>{community.postCount.toLocaleString()} posts</span>
                                </div>
                            </div>

                            {/* Join/Leave Button */}
                            <button
                                onClick={handleJoinToggle}
                                disabled={isJoining || (community.isMember && community.userRole === 'CREATOR')}
                                className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 ${community.isMember
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                    : 'bg-white hover:bg-neutral-200 text-black'
                                    }`}
                            >
                                {isJoining ? 'Loading...' : (community.isMember && community.userRole === 'CREATOR') ? 'Creator' : community.isMember ? 'Leave' : 'Join'}
                            </button>
                        </div>

                        {community.description && (
                            <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl">{community.description}</p>
                        )}

                        {community.userRole && (
                            <span className="inline-block mt-4 px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/20 uppercase tracking-wider">
                                {community.userRole}
                            </span>
                        )}
                    </div>

                </div>

                {/* Community Rules */}
                {community.rules && (
                    <div className="mt-8 p-6 bg-black rounded-2xl border border-neutral-800">
                        <h3 className="font-bold mb-3 text-white uppercase tracking-widest text-xs">Community Rules</h3>
                        <p className="text-sm text-neutral-400 whitespace-pre-line leading-relaxed">{community.rules}</p>
                    </div>
                )}
            </div>

            {/* Posts */}
            <div>
                <h2 className="text-2xl font-black mb-6 text-white tracking-tight">Latest Posts</h2>

                {postsLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onPostUpdate={refresh} showCommunity={false} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-neutral-500 bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-800">
                        <p className="text-xl font-bold mb-2">No posts yet</p>
                        {community.isMember && <p>Be the first to post in this community!</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

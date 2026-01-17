import { usePosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';

interface ProfilePostsProps {
    userId: string;
}

export default function ProfilePosts({ userId }: ProfilePostsProps) {
    const { posts, loading, error, hasMore, loadMore } = usePosts({
        authorId: userId,
        sortBy: 'new'
    });

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                Failed to load posts: {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                <p className="text-neutral-400">No posts yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {posts.map(post => (
                <PostCard key={post.id} post={post} showCommunity={true} />
            ))}

            {hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-800"
                >
                    {loading ? 'Loading...' : 'Load More Posts'}
                </button>
            )}
        </div>
    );
}

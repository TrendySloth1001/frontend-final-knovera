import { useSavedPosts } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';

export default function SavedPosts() {
    const { posts, loading, error, refresh } = useSavedPosts();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Saved Posts</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-6xl mb-4">📌</div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">No saved posts</p>
                    <p className="text-gray-500">Posts you save will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onPostUpdate={refresh} showCommunity={true} />
                    ))}
                </div>
            )}
        </div>
    );
}

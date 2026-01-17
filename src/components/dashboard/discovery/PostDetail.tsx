import { usePost } from '@/hooks/useDiscover';
import PostCard from '@/components/discover/PostCard';
import CommentSection from '@/components/discover/CommentSection';
import { ArrowLeft } from 'lucide-react';

interface PostDetailProps {
    postId: string;
    onBack: () => void;
}

export default function PostDetail({ postId, onBack }: PostDetailProps) {
    const { post, loading, error, refresh } = usePost(postId);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="text-center py-12">
                <button onClick={onBack} className="mb-4 text-white hover:underline">← Back</button>
                <div className="text-6xl mb-4 text-neutral-600">😕</div>
                <p className="text-xl text-neutral-400">Post not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 font-medium"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Post */}
            <PostCard post={post} onPostUpdate={refresh} showCommunity={true} detailed={true} />

            {/* Comments */}
            <div className="mt-8">
                <CommentSection postId={postId} />
            </div>
        </div>
    );
}

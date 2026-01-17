/**
 * Create Post Form Component
 * Form for creating new posts - Dark Mode
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { discoverApi } from '@/lib/discoverApi';
import { CreatePostRequest, PostType, PostVisibility } from '@/types/discover';
import { X, Image, Video, Music, Link, Box, Upload } from 'lucide-react';

interface CreatePostFormProps {
  communityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ communityId, onSuccess, onCancel }: CreatePostFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    description: '',
    postType: PostType.TEXT,
    visibility: PostVisibility.PUBLIC,
    communityId: communityId,
    tags: []
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create post
      const post = await discoverApi.createPost(formData);

      // Upload media files if any
      for (const file of files) {
        await discoverApi.uploadPostMedia(post.id, file);
      }

      // Update postType based on uploaded media
      if (files.length > 0) {
        const hasImages = files.some(f => f.type.startsWith('image/'));
        const hasVideos = files.some(f => f.type.startsWith('video/'));
        const hasAudio = files.some(f => f.type.startsWith('audio/'));

        let postType = PostType.TEXT;
        if (hasImages && !hasVideos && !hasAudio) postType = PostType.IMAGE;
        else if (hasVideos && !hasImages && !hasAudio) postType = PostType.VIDEO;
        else if (hasAudio && !hasImages && !hasVideos) postType = PostType.AUDIO;
        else if (files.length > 0) postType = PostType.MIXED;

        // Update post type on backend if needed
        if (postType !== formData.postType) {
          await discoverApi.updatePost(post.id, {});
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        postType: PostType.TEXT,
        visibility: PostVisibility.PUBLIC,
        communityId,
        tags: []
      });
      setFiles([]);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/discover/post/${post.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-black border border-neutral-800 rounded-3xl p-1 md:p-6">

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Post Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { type: PostType.TEXT, label: 'Text', icon: Box },
              { type: PostType.IMAGE, label: 'Image', icon: Image },
              { type: PostType.VIDEO, label: 'Video', icon: Video },
              { type: PostType.AUDIO, label: 'Audio', icon: Music },
              { type: PostType.LINK, label: 'Link', icon: Link },
              { type: PostType.MIXED, label: 'Mixed', icon: Box },
            ].map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, postType: option.type }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-sm font-bold ${formData.postType === option.type
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                  }`}
              >
                <option.icon size={16} /> {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="An interesting title..."
            className="w-full bg-black border border-neutral-800 rounded-xl p-4 focus:ring-1 focus:ring-white focus:border-white transition-all text-white placeholder:text-neutral-700 font-bold text-lg"
            maxLength={300}
            required
          />
          <p className="text-xs text-neutral-600 mt-2 text-right font-medium">{formData.title.length}/300</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Tell us more..."
            className="w-full bg-black border border-neutral-800 rounded-xl p-4 focus:ring-1 focus:ring-white focus:border-white transition-all text-neutral-300 placeholder:text-neutral-700 min-h-[120px]"
            rows={6}
          />
        </div>

        {/* Community Selector */}
        {!communityId && (
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Community (optional)
            </label>
            <input
              type="text"
              value={formData.communityId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, communityId: e.target.value }))}
              placeholder="Community ID"
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 focus:ring-1 focus:ring-white focus:border-white transition-all text-white placeholder:text-neutral-700"
            />
          </div>
        )}

        {/* Link URL (if link post) */}
        {formData.postType === PostType.LINK && (
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Link URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.linkUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
              placeholder="https://example.com"
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-blue-400 placeholder:text-neutral-700 font-mono text-sm"
              required={formData.postType === PostType.LINK}
            />
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
            }))}
            placeholder="technology, tutorial, news"
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 focus:ring-1 focus:ring-white focus:border-white transition-all text-white placeholder:text-neutral-700"
          />
        </div>

        {/* Media Upload */}
        <div className="bg-black border border-dashed border-neutral-800 rounded-xl p-6 text-center hover:border-neutral-600 transition-colors">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
            multiple
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload size={32} className="text-neutral-500 mb-2" />
            <span className="text-white font-bold text-sm">Upload Media</span>
            <span className="text-neutral-600 text-xs">Images, Videos, or Audio</span>
          </label>

          {files.length > 0 && (
            <div className="mt-6 space-y-2 text-left">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                  <span className="text-sm text-neutral-300 truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-900 font-bold transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim()}
            className="px-8 py-3 bg-white text-black rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg shadow-white/10"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

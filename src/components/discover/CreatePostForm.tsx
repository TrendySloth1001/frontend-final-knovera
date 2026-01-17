/**
 * Create Post Form Component
 * Form for creating new posts - Dark Mode
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { discoverApi } from '@/lib/discoverApi';
import { useUserCommunities, useCommunities } from '@/hooks/useDiscover';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePostRequest, PostType, PostVisibility } from '@/types/discover';
import { X, Image, Video, Music, Link, Box, Upload, Search } from 'lucide-react';

interface CreatePostFormProps {
  communityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({ communityId, onSuccess, onCancel }: CreatePostFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // State for Community Selector
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCommunities, setSelectedCommunities] = useState<Array<{ id: string; name: string; avatarUrl?: string }>>(
    communityId ? [] : []
  );

  // Data Fetching
  const { communities: userCommunities, loading: loadingUserCommunities } = useUserCommunities(user?.user?.id);
  const { communities: searchResults, loading: loadingSearch, refresh: searchCommunities } = useCommunities({
    search: searchTerm,
    limit: 5
  });

  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    description: '',
    postType: PostType.TEXT,
    visibility: PostVisibility.PUBLIC,
    communityId: communityId,
    communityIds: communityId ? [communityId] : [],
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

        {/* Community Selector - Multi-select for crossposting */}
        {!communityId && (
          <div className="relative">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Communities (optional - select multiple for crossposting)
            </label>

            {/* Selected Communities */}
            {selectedCommunities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5"
                  >
                    {community.avatarUrl ? (
                      <img src={community.avatarUrl} alt={community.name} className="w-5 h-5 rounded object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                        {community.name[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white">c/{community.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCommunities(prev => prev.filter(c => c.id !== community.id));
                        setFormData(prev => ({
                          ...prev,
                          communityIds: prev.communityIds?.filter(id => id !== community.id)
                        }));
                      }}
                      className="p-0.5 hover:bg-neutral-800 rounded text-neutral-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="flex items-center bg-black border border-neutral-800 rounded-xl p-3 focus-within:ring-1 focus-within:ring-white focus-within:border-white transition-all">
                <Search size={18} className="text-neutral-500 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                    if (e.target.value) {
                      searchCommunities();
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search and select communities..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-600 p-0 text-sm font-medium"
                />
              </div>

              {/* Dropdown Results */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {/* Loading State */}
                  {(loadingUserCommunities || (searchTerm && loadingSearch)) && (
                    <div className="p-4 text-center text-neutral-500 text-sm">Loading...</div>
                  )}

                  {/* User Communities (Default View) */}
                  {!searchTerm && userCommunities.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase">My Communities</div>
                      {userCommunities.map(community => {
                        const isSelected = selectedCommunities.some(c => c.id === community.id);
                        return (
                          <button
                            key={community.id}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                const newCommunity = {
                                  id: community.id,
                                  name: community.name,
                                  avatarUrl: community.avatarUrl
                                };
                                setSelectedCommunities(prev => [...prev, newCommunity]);
                                setFormData(prev => ({
                                  ...prev,
                                  communityIds: [...(prev.communityIds || []), community.id]
                                }));
                              }
                              setSearchTerm('');
                            }}
                            disabled={isSelected}
                            className={`w-full flex items-center gap-3 p-2 hover:bg-neutral-900 rounded-lg transition-colors text-left ${
                              isSelected ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {community.avatarUrl ? (
                              <img src={community.avatarUrl} alt={community.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                                {community.name[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">
                                c/{community.name} {isSelected && '✓'}
                              </div>
                              <div className="text-xs text-neutral-500 truncate">{community.memberCount} members</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Results */}
                  {searchTerm && searchResults.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-bold text-neutral-500 uppercase">Search Results</div>
                      {searchResults.map(community => {
                        const isSelected = selectedCommunities.some(c => c.id === community.id);
                        return (
                          <button
                            key={community.id}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                const newCommunity = {
                                  id: community.id,
                                  name: community.name,
                                  avatarUrl: community.avatarUrl
                                };
                                setSelectedCommunities(prev => [...prev, newCommunity]);
                                setFormData(prev => ({
                                  ...prev,
                                  communityIds: [...(prev.communityIds || []), community.id]
                                }));
                              }
                              setSearchTerm('');
                            }}
                            disabled={isSelected}
                            className={`w-full flex items-center gap-3 p-2 hover:bg-neutral-900 rounded-lg transition-colors text-left ${
                              isSelected ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {community.avatarUrl ? (
                              <img src={community.avatarUrl} alt={community.name} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
                                {community.name[0]}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">
                                c/{community.name} {isSelected && '✓'}
                              </div>
                              <div className="text-xs text-neutral-500 truncate">{community.memberCount} members</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No Results */}
                  {searchTerm && !loadingSearch && searchResults.length === 0 && (
                    <div className="p-4 text-center text-neutral-500 text-sm">No communities found</div>
                  )}

                  {/* Close Backdrop (Invisible) */}
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                </div>
              )}
            </div>
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

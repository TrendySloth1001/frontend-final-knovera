/**
 * Create Community Form Component
 * Form for creating new communities - Dark Mode
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { discoverApi } from '@/lib/discoverApi';
import { CreateCommunityRequest, PostVisibility } from '@/types/discover';
import { Globe, Lock, Users } from 'lucide-react';

interface CreateCommunityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCommunityForm({ onSuccess, onCancel }: CreateCommunityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCommunityRequest>({
    name: '',
    description: '',
    visibility: PostVisibility.PUBLIC,
    allowMemberPosts: true,
    requireApproval: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Community name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const community = await discoverApi.createCommunity(formData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        visibility: PostVisibility.PUBLIC,
        allowMemberPosts: true,
        requireApproval: false
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/community/${community.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black border border-neutral-800 rounded-3xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Create a Community</h2>
      <p className="text-neutral-400 mb-8">Launch a new space for people to discuss and share.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Community Name <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold group-focus-within:text-white transition-colors">c/</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="community_name"
              className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-4 focus:ring-1 focus:ring-white focus:border-white transition-all text-white placeholder:text-neutral-700 font-bold text-lg"
              required
              pattern="^[a-zA-Z0-9_]+$"
              title="Only letters, numbers, and underscores allowed"
            />
          </div>
          <p className="text-xs text-neutral-600 mt-2 font-medium">
            Only letters, numbers, and underscores. No spaces.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What is this community about?"
            className="w-full bg-black border border-neutral-800 rounded-xl p-4 focus:ring-1 focus:ring-white focus:border-white transition-all text-neutral-300 placeholder:text-neutral-700 min-h-[100px]"
            rows={4}
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Visibility
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: PostVisibility.PUBLIC, label: 'Public', icon: Globe, desc: 'Anyone can view & join' },
              { value: PostVisibility.MEMBERS_ONLY, label: 'Restricted', icon: Users, desc: 'Public view, member posts' },
              { value: PostVisibility.PRIVATE, label: 'Private', icon: Lock, desc: 'Members only' },
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, visibility: option.value }))}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${formData.visibility === option.value
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <option.icon size={16} />
                  <span className="font-bold text-sm">{option.label}</span>
                </div>
                <p className={`text-[10px] uppercase tracking-wide font-bold ${formData.visibility === option.value ? 'text-neutral-500' : 'text-neutral-600'}`}>{option.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Community Rules
          </label>
          <textarea
            value={formData.rules}
            onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
            placeholder="1. Be respectful&#10;2. No spam&#10;3. Stay on topic"
            className="w-full bg-black border border-neutral-800 rounded-xl p-4 focus:ring-1 focus:ring-white focus:border-white transition-all text-neutral-300 placeholder:text-neutral-700 font-mono text-sm"
            rows={5}
          />
        </div>

        {/* Settings */}
        <div className="space-y-4 border-t border-neutral-800 pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="allowMemberPosts"
              checked={formData.allowMemberPosts}
              onChange={(e) => setFormData(prev => ({ ...prev, allowMemberPosts: e.target.checked }))}
              className="mt-1 w-4 h-4 bg-black border-neutral-700 rounded text-white focus:ring-offset-black focus:ring-white"
            />
            <label htmlFor="allowMemberPosts" className="text-sm font-medium text-neutral-300">
              Allow all members to create posts
              <p className="text-xs text-neutral-500 mt-0.5">If unchecked, only moderators can post.</p>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requireApproval"
              checked={formData.requireApproval}
              onChange={(e) => setFormData(prev => ({ ...prev, requireApproval: e.target.checked }))}
              className="mt-1 w-4 h-4 bg-black border-neutral-700 rounded text-white focus:ring-offset-black focus:ring-white"
            />
            <label htmlFor="requireApproval" className="text-sm font-medium text-neutral-300">
              Require moderator approval for new posts
              <p className="text-xs text-neutral-500 mt-0.5">Posts won't appear until approved.</p>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-6 border-t border-neutral-800">
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
            disabled={isSubmitting || !formData.name.trim()}
            className="px-8 py-3 bg-white text-black rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg shadow-white/10"
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
}

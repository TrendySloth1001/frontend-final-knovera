/**
 * Crosspost Drawer Component
 * Drawer for crossposting a post to additional communities
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { discoverApi } from '@/lib/discoverApi';
import { useUserCommunities } from '@/hooks/useDiscover';
import { useAuth } from '@/contexts/AuthContext';
import { Community } from '@/types/discover';

interface CrosspostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  existingCommunityIds: string[];
  onSuccess?: () => void;
}

export default function CrosspostDrawer({
  isOpen,
  onClose,
  postId,
  postTitle,
  existingCommunityIds,
  onSuccess
}: CrosspostDrawerProps) {
  const { user } = useAuth();
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { communities: userCommunities, loading, refresh } = useUserCommunities(user?.user?.id);

  // Removed filtering out existing communities to show them tagged
  const availableCommunities = userCommunities;

  // Further filter by search term
  const filteredCommunities = searchTerm
    ? availableCommunities.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : availableCommunities;

  const handleToggleCommunity = (communityId: string) => {
    setSelectedCommunityIds(prev =>
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleCrosspost = async () => {
    if (selectedCommunityIds.length === 0) {
      setError('Please select at least one community');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await discoverApi.crosspostToCommunities(postId, selectedCommunityIds);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to crosspost');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset state when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCommunityIds([]);
      setError(null);
      setSearchTerm('');
      refresh();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-neutral-800 z-50 shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white">Crosspost</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-neutral-400 font-medium">
            Share "{postTitle.slice(0, 50)}{postTitle.length > 50 ? '...' : ''}" to more communities
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-white focus:border-white transition-all"
            />
          </div>
        </div>

        {/* Community List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading communities...</div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {searchTerm ? 'No communities found' : 'No available communities to crosspost to'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCommunities.map((community) => {
                const isSelected = selectedCommunityIds.includes(community.id);
                const isAlreadyPosted = existingCommunityIds.includes(community.id);

                return (
                  <button
                    key={community.id}
                    onClick={() => !isAlreadyPosted && handleToggleCommunity(community.id)}
                    disabled={isAlreadyPosted}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border-2 ${isAlreadyPosted
                        ? 'bg-neutral-900/50 border-transparent opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'bg-white/5 border-white text-white'
                          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                  >
                    {community.avatarUrl ? (
                      <img
                        src={community.avatarUrl}
                        alt={community.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white text-sm font-bold">
                        {community.name[0]}
                      </div>
                    )}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-bold truncate">c/{community.name}</div>
                      <div className="text-xs text-neutral-500">{community.memberCount} members</div>
                    </div>
                    {isAlreadyPosted ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-500 px-2 py-1 rounded">
                        Posted
                      </span>
                    ) : isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <Check size={16} className="text-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-2">
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded-xl transition-colors border border-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCrosspost}
              disabled={isSubmitting || selectedCommunityIds.length === 0}
              className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Crossposting...' : `Crosspost to ${selectedCommunityIds.length}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

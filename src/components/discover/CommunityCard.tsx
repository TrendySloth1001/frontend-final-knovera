/**
 * Community Card Component
 * Display community preview card
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Community } from '@/types/discover';
import { discoverApi } from '@/lib/discoverApi';

interface CommunityCardProps {
  community: Community;
  onUpdate?: () => void;
}

import { Users, FileText } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
  onUpdate?: () => void;
}

export default function CommunityCard({ community, onUpdate }: CommunityCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(community.isMember);
  const [memberCount, setMemberCount] = useState(community.memberCount);

  const handleJoinToggle = async () => {
    try {
      setIsJoining(true);
      if (isMember) {
        await discoverApi.leaveCommunity(community.id);
        setIsMember(false);
        setMemberCount(prev => prev - 1);
      } else {
        await discoverApi.joinCommunity(community.id);
        setIsMember(true);
        setMemberCount(prev => prev + 1);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to toggle membership:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-black border border-neutral-800 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-white/5 hover:border-neutral-600 transition-all duration-300 overflow-hidden group">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-neutral-900 to-black relative">
        {community.bannerUrl && (
          <img
            src={community.bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="p-4 relative -mt-6">
        {/* Avatar & Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="shrink-0">
            {community.avatarUrl ? (
              <img
                src={community.avatarUrl}
                alt={community.name}
                className="w-16 h-16 rounded-2xl border-4 border-black shadow-lg bg-neutral-900"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl border-4 border-black shadow-lg bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-white font-bold text-2xl">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 pt-6">
            <Link href={`/community/${community.id}`}>
              <h3 className="font-bold text-lg text-white hover:text-neutral-300 cursor-pointer transition-colors mb-1">
                c/{community.name}
              </h3>
            </Link>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-1"><Users size={12} /> {memberCount.toLocaleString()} members</span>
              <span className="flex items-center gap-1"><FileText size={12} /> {community.postCount} posts</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {community.description && (
          <p className="text-sm text-neutral-400 mb-6 line-clamp-2 leading-relaxed h-10">
            {community.description}
          </p>
        )}

        {/* Join Button */}
        <button
          onClick={handleJoinToggle}
          disabled={isJoining || (isMember && community.userRole === 'CREATOR')}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${isMember
            ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 disabled:opacity-50'
            : 'bg-white text-black hover:bg-neutral-200 border border-white'
            }`}
        >
          {isJoining ? 'Wait...' : (isMember && community.userRole === 'CREATOR') ? 'Creator' : isMember ? 'Joined' : 'Join Community'}
        </button>
      </div>
    </div>
  );
}

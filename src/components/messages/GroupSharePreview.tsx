import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, Lock, Globe } from 'lucide-react';
import { createJoinRequest } from '@/lib/groupManagementApi';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ImageStack from './ImageStack';

interface GroupSharePreviewProps {
  groupId: string;
  onJoin?: () => void;
  onOpen?: (groupId: string) => void;
}

export default function GroupSharePreview({ groupId, onJoin, onOpen }: GroupSharePreviewProps) {
  const { token, user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      loadGroupInfo();
    }
  }, [groupId, token, user]);

  const loadGroupInfo = async () => {
    if (!token || !user) return;

    try {
      setLoading(true);
      // Fetch public group info
      const response = await apiClient.get<any>(`/api/chat/conversations/${groupId}/public`);
      setGroup(response);

      // Check membership
      try {
        const fullConversation = await apiClient.get<any>(`/api/chat/conversations/${groupId}?userId=${user.user.id}`);
        const isAlreadyMember = fullConversation.members?.some((member: any) => member.userId === user.user.id);
        setIsMember(isAlreadyMember);
        // If we have full conversation, use its member data for better preview
        if (fullConversation.members) {
          setGroup((prev: any) => ({ ...prev, members: fullConversation.members }));
        }
      } catch (memberCheckError) {
        // Not a member or error, keep public info
        setIsMember(false);
      }
    } catch (err: any) {
      console.error('Failed to load group info:', err);
      setError('Group not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;

    setJoining(true);
    try {
      const response = await createJoinRequest(groupId, '');
      
      // Check if approval is required using the requiresApproval flag
      if (response.requiresApproval === false) {
        // User was directly added to public group - show as member
        setIsMember(true);
        setJoined(false);
        console.log('[GroupSharePreview] Joined public group directly, now a member');
      } else {
        // Join request created for approval-required group - show request sent
        setJoined(true);
        setIsMember(false);
        console.log('[GroupSharePreview] Join request sent, waiting for approval');
      }
      
      onJoin?.();
    } catch (err: any) {
      console.error('Failed to join group:', err);
      if (err.message?.includes('already') || err.message?.includes('Member')) {
        setIsMember(true);
        setJoined(false);
        onJoin?.();
      } else {
        alert(err.message || 'Failed to join group');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleClick = () => {
    if (onOpen) {
      onOpen(groupId);
    }
  };

  if (loading) {
    return (
      <div className="flex flax-wrap items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl animate-pulse min-w-[280px]">
        <div className="w-16 h-16 bg-zinc-800 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <Users size={24} className="text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-400">Group unavailable</p>
        </div>
      </div>
    );
  }

  // Prepare images for stack logic
  // Use members avatars if available, otherwise creator, or empty
  const memberImages = group.members
    ? group.members.map((m: any) => m.user?.avatarUrl).filter(Boolean)
    : group.creator?.avatarUrl ? [group.creator.avatarUrl] : [];

  return (
    <div
      onClick={handleClick}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-black border border-zinc-800 rounded-2xl hover:border-zinc-700 hover:bg-zinc-900/30 transition-all group cursor-pointer w-full max-w-md shadow-sm"
    >
      {/* Group Avatar */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden shadow-inner border border-white/10">
          {group.avatarUrl || group.groupAvatar ? (
            <img src={group.avatarUrl || group.groupAvatar} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-white uppercase select-none">
              {group.name?.substring(0, 2) || 'GR'}
            </span>
          )}
        </div>
        {/* Privacy Badge */}
        <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 border border-zinc-800">
          {group.isPublic ? <Globe size={12} className="text-blue-400" /> : <Lock size={12} className="text-amber-400" />}
        </div>
      </div>

      {/* Group Info */}
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h4 className="font-bold text-white text-base truncate mb-1 pr-2">{group.name}</h4>

        <div className="flex items-center gap-3 mb-2">
          <ImageStack
            images={memberImages}
            totalCount={group.memberCount}
            limit={3}
            size={24}
          />
          <span className="text-xs text-zinc-400">
            {group.memberCount} members
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        {isMember ? (
          <button
            disabled
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-xl cursor-default"
          >
            <Check size={16} className="text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500">Joined</span>
          </button>
        ) : joined ? (
          <button
            disabled
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl cursor-default"
          >
            <Check size={16} className="text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-500">Request Sent</span>
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            {joining ? (
              <span className="text-xs font-semibold">...</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span className="text-xs font-bold">Join</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

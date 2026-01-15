'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Check, XIcon, Clock } from 'lucide-react';
import { ChatConversation, GroupJoinRequest } from '@/types/chat';
import { getJoinRequests, respondToJoinRequest } from '@/lib/groupManagementApi';

interface JoinRequestListProps {
  conversation: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onRequestHandled: () => void;
}

export default function JoinRequestList({
  conversation,
  isOpen,
  onClose,
  currentUserId,
  onRequestHandled,
}: JoinRequestListProps) {
  const [requests, setRequests] = useState<GroupJoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentMember = conversation.members.find(m => m.userId === currentUserId);
  const isCreator = conversation.createdBy === currentUserId;
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canManage = isCreator || isAdmin || isModerator;

  useEffect(() => {
    if (isOpen && canManage) {
      loadRequests();
    }
  }, [isOpen, conversation.id]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getJoinRequests(conversation.id);
      setRequests(data.filter(req => req.status === 'pending'));
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, approve: boolean) => {
    setProcessingId(requestId);
    try {
      await respondToJoinRequest(requestId, approve);
      await loadRequests();
      onRequestHandled();
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${approve ? 'approve' : 'reject'} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  if (!canManage) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-md">
          <p className="text-white text-center">You don&apos;t have permission to view join requests.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Join Requests ({requests.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending join requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-[#0f1419] rounded-lg p-4 border border-gray-700 space-y-3"
                >
                  {/* User Info */}
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        request.user.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userId}`
                      }
                      alt={request.user.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">
                        {request.user.displayName}
                      </div>
                      {request.user.username && (
                        <div className="text-sm text-gray-400">
                          @{request.user.username}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(request.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Request Message */}
                  {request.message && (
                    <div className="bg-[#1a1f2e] rounded p-3 text-sm text-gray-300">
                      &quot;{request.message}&quot;
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(request.id, true)}
                      disabled={processingId === request.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === request.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRespond(request.id, false)}
                      disabled={processingId === request.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

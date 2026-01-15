'use client';

import { useState, useEffect } from 'react';
import { Pin, X as XIcon } from 'lucide-react';
import { ChatConversation, PinnedMessage } from '@/types/chat';
import { getPinnedMessages, unpinMessage } from '@/lib/groupManagementApi';

interface PinnedMessagesPanelProps {
  conversation: ChatConversation;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onMessageClick?: (messageId: string) => void;
}

export default function PinnedMessagesPanel({
  conversation,
  isOpen,
  onClose,
  currentUserId,
  onMessageClick,
}: PinnedMessagesPanelProps) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unpinningId, setUnpinningId] = useState<string | null>(null);

  const currentMember = conversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canUnpin = isAdmin || isModerator;

  useEffect(() => {
    if (isOpen) {
      loadPinnedMessages();
    }
  }, [isOpen, conversation.id]);

  const loadPinnedMessages = async () => {
    setLoading(true);
    try {
      const data = await getPinnedMessages(conversation.id);
      setPinnedMessages(data);
    } catch (error) {
      console.error('Failed to load pinned messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId: string) => {
    if (!canUnpin) return;

    setUnpinningId(messageId);
    try {
      await unpinMessage(conversation.id, messageId);
      await loadPinnedMessages();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to unpin message');
    } finally {
      setUnpinningId(null);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Pin className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Pinned Messages ({pinnedMessages.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Pin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pinned messages</p>
              <p className="text-sm mt-2">Admins and moderators can pin important messages</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pinnedMessages.map((pinnedMsg) => (
                <div
                  key={pinnedMsg.id}
                  className="bg-[#0f1419] rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-colors"
                >
                  {/* Message Content */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => onMessageClick?.(pinnedMsg.messageId)}
                  >
                    {/* Sender Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={
                          pinnedMsg.message.user?.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${pinnedMsg.message.userId}`
                        }
                        alt={pinnedMsg.message.user?.displayName || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">
                          {pinnedMsg.message.user?.displayName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(pinnedMsg.message.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Message Text */}
                    <div className="text-white text-sm whitespace-pre-wrap break-words">
                      {pinnedMsg.message.content}
                    </div>

                    {/* Media Preview */}
                    {pinnedMsg.message.mediaUrl && (
                      <div className="mt-2">
                        {pinnedMsg.message.mediaType?.startsWith('image/') ? (
                          <img
                            src={pinnedMsg.message.mediaUrl}
                            alt="Message media"
                            className="rounded-lg max-w-sm max-h-48 object-cover"
                          />
                        ) : pinnedMsg.message.mediaType?.startsWith('video/') ? (
                          <video
                            src={pinnedMsg.message.mediaUrl}
                            controls
                            className="rounded-lg max-w-sm max-h-48"
                          />
                        ) : null}
                      </div>
                    )}

                    {/* Multiple Media */}
                    {pinnedMsg.message.mediaUrls && pinnedMsg.message.mediaUrls.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {pinnedMsg.message.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative">
                            {pinnedMsg.message.mediaTypes?.[idx]?.startsWith('image/') ? (
                              <img
                                src={url}
                                alt={`Media ${idx + 1}`}
                                className="rounded-lg w-24 h-24 object-cover"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pin Info & Actions */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1a1f2e] border-t border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Pin className="w-3 h-3" />
                      <span>
                        Pinned by {pinnedMsg.user.displayName} •{' '}
                        {formatTimestamp(pinnedMsg.pinnedAt)}
                      </span>
                    </div>

                    {canUnpin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpin(pinnedMsg.messageId);
                        }}
                        disabled={unpinningId === pinnedMsg.messageId}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-xs"
                      >
                        {unpinningId === pinnedMsg.messageId ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            Unpinning...
                          </>
                        ) : (
                          <>
                            <XIcon className="w-3 h-3" />
                            Unpin
                          </>
                        )}
                      </button>
                    )}
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

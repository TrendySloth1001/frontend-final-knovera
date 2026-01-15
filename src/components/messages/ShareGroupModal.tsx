'use client';

import { useState, useEffect } from 'react';
import { X, Search, Send, Users, User, Check } from 'lucide-react';
import { ChatConversation, ChatUser } from '@/types/chat';
import { messagesAPI } from '@/lib/messages';
import { generateGroupShareLink } from '@/utils/groupShareLink';

interface ShareGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToShare: ChatConversation;
  currentUserId: string;
  authToken: string;
}

interface ShareRecipient {
  id: string;
  name: string;
  avatar: string;
  type: 'user' | 'group';
  isSelected: boolean;
}

export default function ShareGroupModal({
  isOpen,
  onClose,
  groupToShare,
  currentUserId,
  authToken,
}: ShareGroupModalProps) {
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<ShareRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = recipients.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipients(filtered);
    } else {
      setFilteredRecipients(recipients);
    }
  }, [searchQuery, recipients]);

  const fetchRecipients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch mutual followers (users I can chat with)
      const mutualFollowers = await messagesAPI.getMutualFollowers(authToken);
      
      // Fetch user's conversations (to get groups)
      const conversations = await messagesAPI.getUserConversations(authToken, currentUserId);
      
      // Filter out the current group being shared and only keep groups
      const groups = conversations.filter(
        (conv: ChatConversation) => conv.isGroup && conv.id !== groupToShare.id
      );
      
      // Build recipients list
      const recipientList: ShareRecipient[] = [
        // Add users
        ...mutualFollowers.map((user: ChatUser) => ({
          id: user.id,
          name: user.displayName,
          avatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName}`,
          type: 'user' as const,
          isSelected: false,
        })),
        // Add groups
        ...groups.map((group: ChatConversation) => ({
          id: group.id,
          name: group.name || 'Unnamed Group',
          avatar: group.groupAvatar || '',
          type: 'group' as const,
          isSelected: false,
        })),
      ];
      
      setRecipients(recipientList);
      setFilteredRecipients(recipientList);
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
      setError('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (recipientId: string) => {
    setRecipients(prev =>
      prev.map(r =>
        r.id === recipientId ? { ...r, isSelected: !r.isSelected } : r
      )
    );
  };

  const handleSend = async () => {
    const selectedRecipients = recipients.filter(r => r.isSelected);
    
    if (selectedRecipients.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const shareLink = generateGroupShareLink(
        groupToShare.id,
        groupToShare.name || 'Group'
      );
      
      const shareMessage = `Hey! Join our group "${groupToShare.name || 'Group'}":\n${shareLink}`;

      // Send message to each selected recipient
      const sendPromises = selectedRecipients.map(async (recipient: ShareRecipient) => {
        if (recipient.type === 'user') {
          // For users, create/find DM conversation and send message
          const conversations = await messagesAPI.getUserConversations(authToken, currentUserId);
          let dmConversation = conversations.find(
            (conv: ChatConversation) => !conv.isGroup && conv.members.some((m: any) => m.userId === recipient.id)
          );

          // If no DM exists, create one
          if (!dmConversation) {
            dmConversation = await messagesAPI.createConversation(authToken, {
              creatorId: currentUserId,
              memberIds: [recipient.id],
              isGroup: false,
            });
          }

          // Send the share message
          await messagesAPI.sendMessage(authToken, {
            conversationId: dmConversation.id,
            userId: currentUserId,
            content: shareMessage,
          });
        } else {
          // For groups, send message directly
          await messagesAPI.sendMessage(authToken, {
            conversationId: recipient.id,
            userId: currentUserId,
            content: shareMessage,
          });
        }
      });

      await Promise.all(sendPromises);

      // Success! Close modal
      onClose();
    } catch (err) {
      console.error('Failed to send share messages:', err);
      setError('Failed to send messages. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = recipients.filter(r => r.isSelected).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Share Group</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              {groupToShare.name || 'Unnamed Group'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search people or groups..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recipients List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={fetchRecipients}
                className="mt-3 text-blue-400 text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-sm">
                {searchQuery ? 'No results found' : 'No recipients available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecipients.map(recipient => (
                <button
                  key={recipient.id}
                  onClick={() => toggleRecipient(recipient.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    recipient.isSelected
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-zinc-800 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    {recipient.avatar ? (
                      <img
                        src={recipient.avatar}
                        alt={recipient.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                        {recipient.type === 'group' ? (
                          <Users size={20} className="text-zinc-400" />
                        ) : (
                          <User size={20} className="text-zinc-400" />
                        )}
                      </div>
                    )}
                    {recipient.isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {recipient.type === 'group' ? 'Group' : 'Direct Message'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              {selectedCount > 0 ? (
                <span>
                  {selectedCount} selected
                </span>
              ) : (
                'Select recipients'
              )}
            </p>
            <button
              onClick={handleSend}
              disabled={selectedCount === 0 || sending}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

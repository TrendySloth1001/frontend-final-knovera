'use client';

import { useState, useEffect } from 'react';
import { discoverApi, ShareConversation } from '@/lib/discoverApi';
import { X, Send, Search, Users, User } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'POST' | 'COMMUNITY';
  contentId: string;
  contentTitle?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle
}: ShareModalProps) {
  const [conversations, setConversations] = useState<ShareConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ShareConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      setSelectedConversations(new Set());
      setMessage('');
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discoverApi.getShareConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleConversation = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleShare = async () => {
    if (selectedConversations.size === 0) {
      setError('Please select at least one conversation');
      return;
    }

    try {
      setSharing(true);
      setError(null);

      // Share to all selected conversations
      await Promise.all(
        Array.from(selectedConversations).map(conversationId =>
          discoverApi.shareContent({
            contentType,
            contentId,
            conversationId,
            message: message.trim() || undefined
          })
        )
      );

      // Close modal on success
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to share content');
      console.error('Error sharing content:', err);
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">
            Share {contentType === 'POST' ? 'Post' : 'Community'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
            disabled={sharing}
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content Title */}
        {contentTitle && (
          <div className="px-4 py-3 bg-neutral-800/50 border-b border-neutral-800">
            <p className="text-sm text-neutral-400 line-clamp-2">{contentTitle}</p>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500"
            />
          </div>
        </div>

        {/* Optional Message */}
        <div className="px-4 py-3 border-b border-neutral-800">
          <textarea
            placeholder="Add a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-neutral-500"
            disabled={sharing}
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              <p>{error}</p>
              <button
                onClick={loadConversations}
                className="mt-2 text-sm text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <p>
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations available'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => toggleConversation(conv.id)}
                  disabled={sharing}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-neutral-800/60 transition-colors ${
                    selectedConversations.has(conv.id) ? 'bg-blue-500/10' : ''
                  } ${sharing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.avatarUrl ? (
                      <img
                        src={conv.avatarUrl}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {conv.isGroup ? (
                          <Users className="w-6 h-6 text-white" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                    {/* Checkbox */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-neutral-900 flex items-center justify-center ${
                        selectedConversations.has(conv.id)
                          ? 'bg-blue-600'
                          : 'bg-neutral-700'
                      }`}
                    >
                      {selectedConversations.has(conv.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{conv.name}</p>
                    <p className="text-sm text-neutral-500">
                      {conv.isGroup ? `${conv.memberCount} members` : 'Direct message'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <button
            onClick={handleShare}
            disabled={sharing || selectedConversations.size === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sharing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Sharing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Share to {selectedConversations.size} {selectedConversations.size === 1 ? 'conversation' : 'conversations'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

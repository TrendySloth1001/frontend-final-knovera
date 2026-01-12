/**
 * Messages Page - Chat Inbox
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { Search, Users, MessageCircle, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MessagesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { conversations, onlineUsers, isConnected, loadConversations, loadOnlineUsers, startOneToOneChat } = useChat();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      loadOnlineUsers();
    }
  }, [isAuthenticated]);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search in conversation name
    if (conv.name?.toLowerCase().includes(query)) return true;
    
    // Search in member names
    return conv.members.some(member => 
      member.user.displayName?.toLowerCase().includes(query) ||
      member.user.username?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = onlineUsers.filter(u => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query)
    );
  });

  const handleStartChat = async (userId: string) => {
    setIsLoading(true);
    try {
      const conversation = await startOneToOneChat(userId);
      router.push(`/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      showNotification('error', error.message || 'Failed to start chat');
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationName = (conv: any) => {
    if (conv.name) return conv.name;
    if (conv.isGroup) return 'Group Chat';
    
    // For one-to-one, show other user's name
    const otherMember = conv.members.find((m: any) => m.userId !== user?.user?.id);
    return otherMember?.user.displayName || 'Unknown User';
  };

  const getConversationAvatar = (conv: any) => {
    if (conv.isGroup) return null;
    const otherMember = conv.members.find((m: any) => m.userId !== user?.user?.id);
    return otherMember?.user.avatarUrl;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Messages</h1>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            )}
          </div>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search conversations or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-full">
          {/* Conversations List */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Conversations
            </h2>

            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start a new chat to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {getConversationAvatar(conv) ? (
                          <img
                            src={getConversationAvatar(conv)}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {getConversationName(conv).charAt(0).toUpperCase()}
                          </div>
                        )}
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-semibold truncate">{getConversationName(conv)}</h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-gray-400 truncate">
                            {conv.lastMessage.user.displayName}: {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Online Users / New Chat */}
          <div className="bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              {showNewChat ? 'Start New Chat' : 'Online Users'}
            </h2>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={36} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers
                  .filter(u => u.id !== user?.user?.id)
                  .map((chatUser) => (
                    <button
                      key={chatUser.id}
                      onClick={() => handleStartChat(chatUser.id)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800 hover:border-gray-700 text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {chatUser.avatarUrl ? (
                            <img
                              src={chatUser.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {(chatUser.displayName?.charAt(0)?.toUpperCase() || chatUser.username?.charAt(0)?.toUpperCase() || '?')}
                            </div>
                          )}
                          {chatUser.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{chatUser.displayName}</h3>
                          <p className="text-xs text-gray-400 truncate">@{chatUser.username}</p>
                        </div>

                        {chatUser.isOnline && (
                          <span className="text-xs text-green-500 flex-shrink-0">Online</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

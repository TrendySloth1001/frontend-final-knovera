/**
 * Conversation Page - Individual chat view
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Loader2, MoreVertical, Users, Phone, Video } from 'lucide-react';
import Link from 'next/link';

export default function ConversationPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const { 
    activeConversation, 
    messages, 
    typingUsers,
    setActiveConversation, 
    loadMessages, 
    sendMessage,
    setTyping,
    markMessageSeen,
    loadConversations,
    conversations
  } = useChat();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (conversationId && isAuthenticated) {
      // Load conversation from list or fetch it
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
      }
      loadMessages(conversationId);
    }

    // Keyboard shortcut: Escape to go back
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/messages');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      setActiveConversation(null);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [conversationId, isAuthenticated, conversations, setActiveConversation, loadMessages, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Mark last message as seen if it's from other user
    if (messages.length > 0 && conversationId && user?.user?.id) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.userId !== user.user.id) {
        markMessageSeen(lastMessage.id);
      }
    }
  }, [messages, conversationId, user, markMessageSeen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending || !conversationId) return;

    const messageContent = inputMessage.trim();
    setInputMessage(''); // Clear immediately for better UX
    setIsSending(true);
    
    try {
      await sendMessage(conversationId, messageContent);
      setTyping(conversationId, false);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showNotification('error', error.message || 'Failed to send message');
      setInputMessage(messageContent); // Restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Send typing indicator
    if (conversationId) {
      setTyping(conversationId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(conversationId, false);
      }, 2000);
    }
  };

  const getConversationName = () => {
    if (!activeConversation) return 'Loading...';
    if (activeConversation.name) return activeConversation.name;
    if (activeConversation.isGroup) return 'Group Chat';
    
    const otherMember = activeConversation.members.find(m => m.userId !== user?.user?.id);
    return otherMember?.user.displayName || 'Unknown User';
  };

  const getConversationAvatar = () => {
    if (!activeConversation || activeConversation.isGroup) return null;
    const otherMember = activeConversation.members.find(m => m.userId !== user?.user?.id);
    return otherMember?.user.avatarUrl;
  };

  const isOtherUserOnline = () => {
    if (!activeConversation || activeConversation.isGroup) return false;
    const otherMember = activeConversation.members.find(m => m.userId !== user?.user?.id);
    return otherMember?.user.isOnline || false;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const currentTypingUsers = typingUsers.filter(
    t => t.conversationId === conversationId && t.userId !== user?.user?.id
  );

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
          <div className="flex items-center gap-4">
            <Link 
              href="/messages"
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>

            {/* Conversation Info */}
            <div className="flex items-center gap-3">
              {getConversationAvatar() ? (
                <div className="relative">
                  <img
                    src={getConversationAvatar()!}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isOtherUserOnline() && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {getConversationName().charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="font-semibold">{getConversationName()}</h2>
                {isOtherUserOnline() && (
                  <p className="text-xs text-green-500">Online</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.userId === user?.user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="flex-shrink-0">
                        {message.user.avatarUrl ? (
                          <img
                            src={message.user.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {message.user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {currentTypingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8" />
                <div className="px-4 py-3 rounded-2xl bg-gray-800">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

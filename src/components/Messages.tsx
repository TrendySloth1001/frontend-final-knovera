/**
 * Messages Component - Complete P2P Messaging Interface
 * Full-featured messaging UI with conversation list and chat view
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { messagesAPI } from '@/lib/messages';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  ChatUser,
  ChatConversation,
  ChatMessage,
  ServerMessage,
} from '@/types/chat';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  MoreVertical,
  Users,
  X,
  Check,
  CheckCheck,
  Pin,
} from 'lucide-react';

// Format time helper function
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return date.toLocaleDateString();
}

interface MessagesProps {
  onClose?: () => void;
  initialUserId?: string; // User ID to start a chat with
}

export default function Messages({ onClose, initialUserId }: MessagesProps) {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isStartingChat, setIsStartingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const selectedConversationRef = useRef<ChatConversation | null>(null);

  const currentUserId = user?.user?.id;
  // Check authentication: use token and userId from AuthContext
  const canUseMessaging = !authLoading && !!(token && currentUserId);

  // WebSocket connection - only connect when we have a valid userId
  const { isConnected, sendMessage } = useWebSocket({
    userId: currentUserId || '', // Pass empty string only if truly undefined
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error('[Messages] WebSocket error:', error);
      // Don't show notification - reconnection is handled automatically
      // Only log for debugging
    },
    onConnect: () => {
      // Join all conversations on connect
      if (conversations.length > 0 && currentUserId) {
        conversations.forEach((conv) => {
          sendMessage({
            type: 'join_conversation',
            data: { conversationId: conv.id, userId: currentUserId },
          });
        });
      }
    },
  });

  function handleWebSocketMessage(message: ServerMessage) {
    switch (message.type) {
      case 'new_message':
        const newMsg = message.data as ChatMessage;
        
        // Use ref to avoid stale closure
        if (newMsg.conversationId === selectedConversationRef.current?.id) {
          setMessages((prev) => {
            // Prevent duplicates
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) {
              return prev;
            }
            return [...prev, newMsg];
          });
          scrollToBottom();
        } else {
          // Show notification for messages in other conversations
          if (newMsg.userId !== currentUserId) {
            showNotification('info', `New message from ${newMsg.user?.displayName || 'Unknown'}`);
          }
        }
        // Update conversation list to show latest message
        loadConversations();
        break;

      case 'typing':
        const typingData = message.data;
        
        // Use ref to avoid stale closure and filter out own typing
        if (typingData.conversationId === selectedConversationRef.current?.id && typingData.userId !== currentUserId) {
          if (typingData.isTyping) {
            setTypingUsers((prev) => {
              const next = new Set(prev).add(typingData.userId);
              return next;
            });
          } else {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(typingData.userId);
              return next;
            });
          }
        }
        break;

      case 'message_seen':
        const seenData = message.data;
        if (seenData.conversationId === selectedConversation?.id) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === seenData.messageId
                ? {
                    ...msg,
                    seenBy: [
                      ...(msg.seenBy || []),
                      {
                        userId: seenData.userId,
                        username: seenData.username,
                        seenAt: seenData.seenAt,
                      },
                    ],
                  }
                : msg
            )
          );
        }
        break;

      case 'user_online':
      case 'user_offline':
        // Update user online status in conversations
        loadConversations();
        break;

      case 'error':
        const errorMsg = message.data?.message || 'An error occurred';
        console.error('[Messages] WebSocket error:', errorMsg);
        // Only show error if it's meaningful to the user (not internal protocol errors)
        if (errorMsg && !errorMsg.includes('Unknown message type')) {
          showNotification('error', errorMsg);
        }
        break;
    }
  }

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!token || !currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await messagesAPI.getUserConversations(token, currentUserId);
      
      // Deduplicate conversations by ID - keep the most recent one
      const seenIds = new Set<string>();
      const uniqueConversations = data.filter((conv) => {
        if (seenIds.has(conv.id)) {
          return false;
        }
        seenIds.add(conv.id);
        return true;
      });
      
      setConversations(uniqueConversations || []);
    } catch (error: any) {
      console.error('[Messages] Failed to load conversations:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to load conversations';
      showNotification('error', errorMessage);
      setConversations([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUserId, showNotification]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async () => {
    if (!token || !selectedConversation || !currentUserId) return;

    try {
      const data = await messagesAPI.getMessages(token, selectedConversation.id, 50);
      setMessages(data.reverse()); // Reverse to show oldest first
      scrollToBottom();

      // Join conversation via WebSocket
      sendMessage({
        type: 'join_conversation',
        data: { conversationId: selectedConversation.id, userId: currentUserId },
      });
    } catch (error: any) {
      console.error('[Messages] Failed to load messages:', error);
      showNotification('error', error.message || 'Failed to load messages');
    }
  }, [token, selectedConversation, currentUserId, sendMessage, showNotification]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !token || !selectedConversation || !currentUserId || isSending) {
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    // Stop typing indicator
    handleTyping(false);

    try {
      const newMessage = await messagesAPI.sendMessage(token, {
        conversationId: selectedConversation.id,
        userId: currentUserId,
        content,
      });

      // Optimistically add message to UI
      setMessages((prev) => {
        // Check if message already exists (from WebSocket)
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
      scrollToBottom();

      // Server automatically broadcasts new_message via WebSocket to all users
      // No need to manually send WebSocket event

      // Mark as seen immediately for sender
      await messagesAPI.markMessageSeen(token, newMessage.id);

      // Show success notification for first message
      if (messages.length === 0) {
        showNotification('success', 'Message sent successfully!');
      }

      // Reload conversations to update last message
      loadConversations();
    } catch (error: any) {
      console.error('[Messages] Failed to send message:', error);
      showNotification('error', error.message || 'Failed to send message');
      setMessageInput(content); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Send media message
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !selectedConversation || !currentUserId) return;

    try {
      setIsSending(true);
      const uploadResult = await messagesAPI.uploadMedia(token, file);
      const mediaMessage = await messagesAPI.sendMediaMessage(
        token,
        selectedConversation.id,
        uploadResult.url,
        uploadResult.mimetype
      );

      setMessages((prev) => [...prev, mediaMessage]);
      scrollToBottom();
    } catch (error: any) {
      console.error('[Messages] Failed to send media:', error);
      showNotification('error', error.message || 'Failed to send media');
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Start new conversation
  const handleStartChat = async (otherUserId: string) => {
    if (!token || !currentUserId || isStartingChat) return;

    try {
      setIsStartingChat(true);
      const conversation = await messagesAPI.checkOrCreateOneToOne(token, otherUserId);
      setSelectedConversation(conversation);
      setShowUserSearch(false);
      loadConversations();
    } catch (error: any) {
      console.error('[Messages] Failed to start chat:', error);
      showNotification('error', error.message || 'Failed to start chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Load available users for new chat
  const loadAvailableUsers = useCallback(async () => {
    if (!token) return;

    try {
      const users = await messagesAPI.getAllUsers(token);
      // Filter out current user
      setAvailableUsers(users.filter((u) => u.id !== currentUserId));
    } catch (error: any) {
      console.error('[Messages] Failed to load users:', error);
    }
  }, [token, currentUserId]);

  // Typing indicator with debouncing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedConversation || !currentUserId) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        // Send typing start immediately if not already typing
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          sendMessage({
            type: 'typing',
            data: {
              conversationId: selectedConversation.id,
              userId: currentUserId,
              isTyping: true,
            },
          });
        }

        // Set timeout to stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          sendMessage({
            type: 'typing',
            data: {
              conversationId: selectedConversation.id,
              userId: currentUserId,
              isTyping: false,
            },
          });
        }, 3000);
      } else {
        // Send typing stop immediately
        if (isTypingRef.current) {
          isTypingRef.current = false;
          sendMessage({
            type: 'typing',
            data: {
              conversationId: selectedConversation.id,
              userId: currentUserId,
              isTyping: false,
            },
          });
        }
      }
    },
    [selectedConversation, currentUserId, sendMessage]
  );

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Mark messages as seen
  const markMessagesAsSeen = async () => {
    if (!token || !selectedConversation || !messages.length) return;

    const unreadMessages = messages.filter(
      (msg) => msg.userId !== currentUserId && !msg.seenBy?.some((s) => s.userId === currentUserId)
    );

    for (const msg of unreadMessages) {
      try {
        await messagesAPI.markMessageSeen(token, msg.id);
      } catch (error) {
        console.error('[Messages] Failed to mark message as seen:', error);
      }
    }
  };

  // Start chat with initial user if provided
  useEffect(() => {
    // Only run when we have auth and initialUserId
    if (!authLoading && initialUserId && token && currentUserId && initialUserId !== currentUserId && !selectedConversation) {
      const startChat = async () => {
        try {
          const conversation = await messagesAPI.checkOrCreateOneToOne(token, initialUserId);
          setSelectedConversation(conversation);
          setShowUserSearch(false);
          loadConversations();
        } catch (error: any) {
          console.error('[Messages] Failed to start chat:', error);
          showNotification('error', error.message || 'Failed to start chat');
        }
      };
      startChat();
    }
  }, [authLoading, initialUserId, token, currentUserId, selectedConversation, showNotification, loadConversations]);

  // Effects - Load conversations when authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if we have the required data
    const hasRequiredData = !!(token && currentUserId);
    
    if (hasRequiredData) {
      loadConversations();
    } else {
      setIsLoading(false);
    }
  }, [authLoading, currentUserId, token, loadConversations]);

  useEffect(() => {
    // Update ref to avoid stale closures in WebSocket handler
    selectedConversationRef.current = selectedConversation;

    if (selectedConversation) {
      loadMessages();
    } else {
      setMessages([]);
      // Clear typing indicator when switching conversations
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      isTypingRef.current = false;
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    if (selectedConversation && messages.length > 0 && token && currentUserId) {
      // Mark messages as seen
      const unreadMessages = messages.filter(
        (msg) => msg.userId !== currentUserId && !msg.seenBy?.some((s) => s.userId === currentUserId)
      );

      for (const msg of unreadMessages) {
        messagesAPI.markMessageSeen(token, msg.id).catch(error => {
          console.error('[Messages] Failed to mark message as seen:', error);
        });
      }
    }
  }, [selectedConversation, messages, token, currentUserId]);

  useEffect(() => {
    if (showUserSearch && token) {
      loadAvailableUsers();
    }
  }, [showUserSearch, token, loadAvailableUsers]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (conv.name?.toLowerCase().includes(query)) return true;
    if (conv.isGroup) {
      return conv.members.some((m) => m.user.displayName.toLowerCase().includes(query));
    } else {
      const otherUser = conv.members.find((m) => m.userId !== currentUserId);
      return otherUser?.user.displayName.toLowerCase().includes(query) || false;
    }
  });

  // Get conversation display name
  const getConversationName = (conv: ChatConversation): string => {
    if (conv.name) return conv.name;
    if (conv.isGroup) {
      return conv.members.map((m) => m.user.displayName).join(', ');
    }
    const otherUser = conv.members.find((m) => m.userId !== currentUserId);
    return otherUser?.user.displayName || 'Unknown User';
  };

  // Get conversation avatar
  const getConversationAvatar = (conv: ChatConversation): string | null => {
    if (conv.isGroup) return null;
    const otherUser = conv.members.find((m) => m.userId !== currentUserId);
    return otherUser?.user.avatarUrl || null;
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Only show login message if we're sure user is not authenticated (after loading completes)
  if (!authLoading && !canUseMessaging) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Please log in to use messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-80 border-r border-neutral-800 flex flex-col h-full bg-black ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* User Profile Header - Fixed Height */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.user?.avatarUrl ? (
                <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
              ) : (
                <MessageSquare size={18} className="text-neutral-600" />
              )}
            </div>
            {/* Username & Status */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <span className="font-medium text-sm text-white truncate leading-tight">
                {user?.user?.displayName || 'User'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-neutral-600'}`} />
                <span className="text-[11px] text-neutral-500 leading-none">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => setShowUserSearch(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors"
              title="New chat"
            >
              <Plus size={18} className="text-neutral-400" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors md:hidden"
                title="Close"
              >
                <X size={18} className="text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-neutral-900/50">
          <input 
            type="text" 
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 rounded-lg py-2 px-3 text-[13px] focus:outline-none focus:border-neutral-800 focus:bg-black transition-all text-white placeholder-neutral-600"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs uppercase tracking-widest">Loading...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-4 text-center">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p className="text-sm mb-1">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="mt-4 px-4 py-2 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all text-sm font-medium"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {/* Pinned Conversations */}
              {filteredConversations.filter(c => c.isPinned).length > 0 && (
                <>
                  <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Pinned</div>
                  {filteredConversations.filter(c => c.isPinned).map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      currentUserId={currentUserId!}
                      isSelected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))}
                </>
              )}

              {/* Recent Messages */}
              {filteredConversations.filter(c => !c.isPinned).length > 0 && (
                <>
                  <div className="px-3 py-2 mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    {filteredConversations.filter(c => c.isPinned).length > 0 ? 'Recent Messages' : 'Messages'}
                  </div>
                  {filteredConversations.filter(c => !c.isPinned).map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      currentUserId={currentUserId!}
                      isSelected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat View */}
      <main className={`flex-1 flex flex-col bg-black relative ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            {/* Chat Header - Fixed Height */}
            <div className="h-16 px-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors mr-2 flex-shrink-0"
                title="Back to conversations"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Left: Avatar + User Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar */}
                {selectedConversation.isGroup ? (
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                    <Users size={18} className="text-neutral-600" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {getConversationAvatar(selectedConversation) ? (
                      <img
                        src={getConversationAvatar(selectedConversation)!}
                        alt={getConversationName(selectedConversation)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-neutral-500">
                        {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                {/* Username & Status */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-white truncate leading-tight">
                    {getConversationName(selectedConversation)}
                  </h3>
                  {!selectedConversation.isGroup && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        selectedConversation.members.find((m) => m.userId !== currentUserId)?.user.isOnline
                          ? 'bg-green-500'
                          : 'bg-neutral-600'
                      }`} />
                      <span className="text-[11px] text-neutral-500 leading-none">
                        {selectedConversation.members.find((m) => m.userId !== currentUserId)?.user.isOnline
                          ? 'Online'
                          : 'Offline'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Connection Status + Actions */}
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                {/* Connection Status */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                  }`} />
                  <span className={`text-[11px] leading-none ${
                    isConnected ? 'text-neutral-500' : 'text-yellow-600'
                  }`}>
                    {isConnected ? 'Connected' : 'Connecting'}
                  </span>
                </div>
                {/* Menu Button */}
                <button 
                  className="w-8 h-8 flex items-center justify-center hover:bg-neutral-900 rounded-lg transition-colors"
                  title="More options"
                >
                  <MoreVertical size={18} className="text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => {
                const isOwn = msg.userId === currentUserId;
                const isSeen = msg.seenBy?.some((s) => s.userId !== currentUserId);

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {msg.user?.avatarUrl ? (
                            <img
                              src={msg.user.avatarUrl}
                              alt={msg.user.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-neutral-500">
                              {msg.user?.displayName.substring(0, 2).toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && (
                          <span className="text-xs text-neutral-500 mb-1 px-3">
                            {msg.user?.displayName || msg.username || 'Unknown'}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-900 text-white'
                          }`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-2">
                              {msg.mediaType?.startsWith('image/') ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="Media"
                                  className="max-w-full rounded-lg"
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  View media
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-3">
                          <span className="text-[11px] text-neutral-600">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isOwn && (
                            <span className="text-xs">
                              {isSeen ? (
                                <CheckCheck size={12} className="text-blue-500" />
                              ) : (
                                <Check size={12} className="text-neutral-600" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <span className="text-xs">...</span>
                    </div>
                    <div className="bg-neutral-800 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors flex-shrink-0"
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      if (e.target.value.trim()) {
                        handleTyping(true);
                      } else {
                        handleTyping(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white resize-none max-h-32"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="p-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">or start a new one</p>
            </div>
          </div>
        )}
      </main>

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => setShowUserSearch(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartChat(user.id)}
                    disabled={isStartingChat}
                    className="w-full p-3 hover:bg-neutral-800 rounded-lg transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{user.displayName.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.displayName}</p>
                      {user.username && <p className="text-xs text-neutral-500">@{user.username}</p>}
                    </div>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}} />
    </div>
  );
}

// Conversation Item Component
interface ConversationItemProps {
  conv: ChatConversation;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationItem({ conv, currentUserId, isSelected, onClick }: ConversationItemProps) {
  const otherUser = !conv.isGroup
    ? conv.members.find((m) => m.userId !== currentUserId)
    : null;
  const isOnline = otherUser?.user.isOnline;
  const conversationName = conv.name || (conv.isGroup 
    ? conv.members.map((m) => m.user.displayName).join(', ')
    : otherUser?.user.displayName || 'Unknown User');
  const lastMessageText = conv.lastMessage 
    ? (conv.lastMessage.userId === currentUserId ? 'You: ' : '') + (conv.lastMessage.content || 'Media')
    : 'No messages yet';
  const lastMessageTime = conv.lastMessage 
    ? formatTime(conv.lastMessage.createdAt)
    : '';
  
  // Calculate unread count (messages not seen by current user)
  const unreadCount = conv.messages?.filter(
    (msg: any) => msg.userId !== currentUserId && !msg.seenBy?.some((s: any) => s.userId === currentUserId)
  ).length || 0;

  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
        ${isSelected ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'}
      `}
    >
      <div className="relative">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center border
          ${isSelected ? 'bg-black/10 border-black/5' : 'bg-zinc-900 border-white/5'}
        `}>
          {conv.isGroup ? (
            <Users size={22} className={isSelected ? 'text-black' : 'text-zinc-400'} />
          ) : (
            otherUser?.user.avatarUrl ? (
              <img 
                src={otherUser.user.avatarUrl} 
                alt={conversationName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className={`text-sm font-semibold ${isSelected ? 'text-black' : 'text-zinc-400'}`}>
                {conversationName.substring(0, 2).toUpperCase()}
              </span>
            )
          )}
        </div>
        {!conv.isGroup && isOnline && (
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 bg-emerald-500 ${isSelected ? 'border-white' : 'border-black'}`} />
        )}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`text-sm font-bold truncate ${isSelected ? 'text-black' : 'text-zinc-100'}`}>
            {conversationName}
          </span>
          {lastMessageTime && (
            <span className={`text-[10px] font-medium flex-shrink-0 ml-2 ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
              {lastMessageTime}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate font-medium ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
            {lastMessageText}
          </p>
          <div className="flex items-center gap-2 ml-2">
            {unreadCount > 0 && !isSelected && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
            {conv.isPinned && !isSelected && (
              <Pin size={12} className="text-zinc-700" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}


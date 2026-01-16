/**
 * Chat Context - Manages chat state and WebSocket connection
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { chatAPI } from '@/lib/chat-api';
import { wsService } from '@/lib/websocket';
import { 
  ChatConversation, 
  ChatMessage, 
  ChatUser, 
  OnlineStatus, 
  TypingStatus,
  WebSocketMessage 
} from '@/types/chat';

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  typingUsers: TypingStatus[];
  unreadCount: number;
  isConnected: boolean;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (memberUserIds: string[], isGroup: boolean, name?: string) => Promise<ChatConversation>;
  startOneToOneChat: (userId: string) => Promise<ChatConversation>;
  markMessageSeen: (messageId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  loadOnlineUsers: () => Promise<void>;
  ensureChatUser: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [chatUserCreated, setChatUserCreated] = useState(false);

  // Ensure chat user exists
  const ensureChatUser = useCallback(async () => {
    if (!user || !token || chatUserCreated) return;

    try {
      // Check if user already has username set
      if (user.user.username) {
        setChatUserCreated(true);
        return;
      }

      // Generate username from displayName or email
      const username = user.user.displayName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      await chatAPI.createChatUser(token, username);
      setChatUserCreated(true);
    } catch (error: any) {
      // User might already exist or have username, which is fine
      console.error('Chat user setup:', error);
      setChatUserCreated(true); // Continue anyway
    }
  }, [user, token, chatUserCreated]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.user?.id || !token) return;

    try {
      const convs = await chatAPI.getUserConversations(token, user.user.id);
      setConversations(convs);

      // Calculate total unread count
      const total = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [user, token]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!token) return;

    try {
      const msgs = await chatAPI.getMessages(token, conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [token]);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!token || !user) return;

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      conversationId,
      userId: user.user.id,
      user: {
        id: user.user.id,
        username: user.user.username || null,
        displayName: user.user.displayName,
        avatarUrl: user.user.avatarUrl || null,
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
      },
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Update conversation's last message and move to top optimistically
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: optimisticMessage, updatedAt: optimisticMessage.createdAt }
          : conv
      );
      return updated.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    try {
      // Send actual message
      const message = await chatAPI.sendMessage(token, { conversationId, userId: user.user.id, content });
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => 
        m.id === optimisticMessage.id ? message : m
      ));
      
      // Update conversation with real message
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        );
        return updated.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      
      // Restore previous conversation state
      await loadConversations();
      
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [token]);

  // Create conversation
  const createConversation = useCallback(async (
    memberUserIds: string[], 
    isGroup: boolean, 
    name?: string
  ): Promise<ChatConversation> => {
    if (!token) throw new Error('Not authenticated');

    try {
      const conversation = await chatAPI.createConversation(token, {
        memberIds: memberUserIds,
        isGroup,
        name,
        creatorId: user?.user?.id || '',
      });
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }, [token]);

  // Start one-to-one chat
  const startOneToOneChat = useCallback(async (userId: string): Promise<ChatConversation> => {
    if (!token) throw new Error('Not authenticated');

    try {
      const conversation = await chatAPI.getOrCreateOneToOne(token, userId);
      
      // Add to conversations if not already there
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });

      return conversation;
    } catch (error) {
      console.error('Failed to start chat:', error);
      throw error;
    }
  }, [token]);

  // Mark message as seen
  const markMessageSeen = useCallback((messageId: string) => {
    if (activeConversation) {
      wsService.markMessageSeen(messageId, activeConversation.id);
    }
  }, [activeConversation]);

  // Set typing status
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    wsService.sendTyping(conversationId, isTyping);
  }, []);

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    if (!token) return;

    try {
      const users = await chatAPI.getOnlineUsers(token);
      setOnlineUsers(users);
    } catch (error) {
      console.error('Failed to load online users:', error);
    }
  }, [token]);

  // Handle WebSocket messages
  useEffect(() => {
    const handleMessage = (wsMessage: WebSocketMessage) => {
      switch (wsMessage.type) {
        case 'message':
        case 'new_message':
          const newMessage: ChatMessage = wsMessage.data;
          
          // Add to messages if in active conversation
          if (activeConversation?.id === newMessage.conversationId) {
            setMessages(prev => {
              // Check if message already exists (either real or optimistic)
              const existingIndex = prev.findIndex(m => 
                m.id === newMessage.id || 
                (m.id.startsWith('temp-') && m.content === newMessage.content && m.userId === newMessage.userId)
              );
              
              if (existingIndex >= 0) {
                // Replace optimistic/existing message with real one
                const updated = [...prev];
                updated[existingIndex] = newMessage;
                return updated;
              }
              
              // Add new message
              return [...prev, newMessage];
            });
          } else if (newMessage.userId !== user?.user?.id) {
            // Show notification for new message in other conversations
            showNotification('info', `New message from ${newMessage.user?.displayName || 'Someone'}`);
          }

          // Update conversation last message and unread count
          setConversations(prev => prev.map(conv => {
            if (conv.id === newMessage.conversationId) {
              const isActive = activeConversation?.id === conv.id;
              return {
                ...conv,
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt,
                unreadCount: isActive ? conv.unreadCount : (conv.unreadCount || 0) + 1,
              };
            }
            return conv;
          }));
          break;

        case 'typing':
          const typingStatus: TypingStatus = wsMessage.data;
          setTypingUsers(prev => {
            const filtered = prev.filter(t => 
              !(t.conversationId === typingStatus.conversationId && t.userId === typingStatus.userId)
            );
            return typingStatus.isTyping ? [...filtered, typingStatus] : filtered;
          });
          break;

        case 'online':
          const onlineStatus: OnlineStatus = wsMessage.data;
          setOnlineUsers(prev => prev.map(u => 
            u.id === onlineStatus.userId 
              ? { ...u, isOnline: onlineStatus.isOnline, lastActiveAt: onlineStatus.lastActiveAt }
              : u
          ));
          break;

        case 'seen':
        case 'message_seen':
          // Handle message seen updates
          const { messageId, userId: seenUserId, username: seenUsername, displayName: seenDisplayName, avatarUrl: seenAvatarUrl } = wsMessage.data;
          setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
              const seenBy = msg.seenBy || [];
              const alreadySeen = seenBy.find(s => s.userId === seenUserId);
              if (!alreadySeen) {
                return {
                  ...msg,
                  seenBy: [...seenBy, { 
                    userId: seenUserId, 
                    username: seenUsername || '', 
                    displayName: seenDisplayName || 'User',
                    avatarUrl: seenAvatarUrl,
                    seenAt: new Date().toISOString()
                  }],
                };
              }
            }
            return msg;
          }));
          break;
      }
    };

    const unsubscribe = wsService.onMessage(handleMessage);
    return unsubscribe;
  }, [activeConversation]);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.user?.id && chatUserCreated) {
      wsService.connect(user.user.id);

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      const unsubConnect = wsService.onConnect(onConnect);
      const unsubDisconnect = wsService.onDisconnect(onDisconnect);

      return () => {
        unsubConnect();
        unsubDisconnect();
        wsService.disconnect();
      };
    }
  }, [isAuthenticated, user, chatUserCreated]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && token && chatUserCreated) {
      loadConversations();
      loadOnlineUsers();

      // Refresh conversations every 30 seconds
      const intervalId = setInterval(() => {
        loadConversations();
        loadOnlineUsers();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, token, chatUserCreated, loadConversations, loadOnlineUsers]);

  // Ensure chat user on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      ensureChatUser();
    }
  }, [isAuthenticated, user, ensureChatUser]);

  const value: ChatContextType = {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadCount,
    isConnected,
    setActiveConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    startOneToOneChat,
    markMessageSeen,
    setTyping,
    loadOnlineUsers,
    ensureChatUser,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

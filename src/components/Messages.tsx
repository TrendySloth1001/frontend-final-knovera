/**
 * Messages Component - Complete P2P Messaging Interface
 * Full-featured messaging UI with conversation list and chat view
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
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
import Drawer from './Drawer';
import { apiClient } from '@/lib/api';

// Import all message components
import ConversationsList from './messages/ConversationsList';
import ChatHeader from './messages/ChatHeader';
import MessagesList from './messages/MessagesList';
import MessageInput from './messages/MessageInput';
import EmptyChatView from './messages/EmptyChatView';
import UserSearchModal from './messages/UserSearchModal';
import GroupCreateModal from './messages/GroupCreateModal';
import GroupMembersDrawer from './messages/GroupMembersDrawer';
import DeleteConfirmModal from './messages/DeleteConfirmModal';
import ProfileDrawerContent from './messages/ProfileDrawerContent';
import AddMembersModal from './messages/AddMembersModal';
import MediaPreviewModal from './messages/MediaPreviewModal';
import ForwardMessageModal from './messages/ForwardMessageModal';
import EditHistoryModal from './messages/EditHistoryModal';

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
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedGroupConversation, setSelectedGroupConversation] = useState<ChatConversation | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<ChatUser | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [isLoadingMutualFollowers, setIsLoadingMutualFollowers] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [editHistoryData, setEditHistoryData] = useState<{ current: string; history: Array<{ content: string; editedAt: string }> } | null>(null);
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
        const newMsg = message.data as ChatMessage & { unreadCount?: number };
        console.log('[Messages] New message received:', {
          messageId: newMsg.id,
          conversationId: newMsg.conversationId,
          unreadCount: newMsg.unreadCount
        });

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
            const senderName = newMsg.user?.displayName || 'Someone';
            const preview = newMsg.content ? (newMsg.content.length > 50 ? newMsg.content.substring(0, 50) + '...' : newMsg.content) : 'Sent a message';
            showNotification('info', `${senderName}: ${preview}`);
          }
        }

        // Update conversation list with unread count from WebSocket
        if (typeof newMsg.unreadCount !== 'undefined') {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newMsg.conversationId
                ? { ...conv, unreadCount: newMsg.unreadCount }
                : conv
            )
          );
        } else {
          // Fallback: reload conversations to get fresh unread counts from backend
          setTimeout(() => loadConversations(true), 100);
        }
        break;

      case 'typing':
        const typingData = message.data;
        console.log('[Messages] Typing event received:', {
          conversationId: typingData.conversationId,
          userId: typingData.userId,
          isTyping: typingData.isTyping,
          selectedConversation: selectedConversationRef.current?.id,
          currentUserId
        });

        // Use ref to avoid stale closure and filter out own typing
        if (typingData.conversationId === selectedConversationRef.current?.id && typingData.userId !== currentUserId) {
          console.log('[Messages] Updating typing users...');
          if (typingData.isTyping) {
            setTypingUsers((prev) => {
              const next = new Set(prev).add(typingData.userId);
              console.log('[Messages] Added typing user:', typingData.userId, 'Total:', next.size);
              return next;
            });
          } else {
            setTypingUsers((prev) => {
              const next = new Set(prev);
              next.delete(typingData.userId);
              console.log('[Messages] Removed typing user:', typingData.userId, 'Total:', next.size);
              return next;
            });
          }
        }
        break;

      case 'message_seen':
        const seenData = message.data as { conversationId: string; messageId: string; userId: string; username: string; seenAt: string; unreadCount?: number };
        console.log('[Messages] Message seen event - Blue tick update:', {
          conversationId: seenData.conversationId,
          messageId: seenData.messageId,
          userId: seenData.userId,
          username: seenData.username,
          unreadCount: seenData.unreadCount
        });

        // Update the message in the messages array if it's the current conversation
        if (seenData.conversationId === selectedConversation?.id) {
          console.log('[Messages] Updating blue tick for message:', seenData.messageId);
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

        // Update conversation unread count from WebSocket
        if (typeof seenData.unreadCount !== 'undefined') {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === seenData.conversationId
                ? { ...conv, unreadCount: seenData.unreadCount }
                : conv
            )
          );
        } else {
          // Fallback: refresh conversation list to update unread counts
          setTimeout(() => loadConversations(true), 100);
        }
        break;

      case 'user_online':
      case 'user_offline':
        // Update user online status in conversations
        loadConversations();
        break;

      case 'conversation_created':
        // New conversation initiated by another user
        const newConversation = message.data;
        console.log('[Messages] New conversation created:', newConversation);

        // Add to conversations list
        setConversations((prev) => {
          // Check if conversation already exists
          const exists = prev.some(conv => conv.id === newConversation.id);
          if (exists) {
            return prev;
          }
          // Add new conversation to the top
          return [newConversation, ...prev];
        });

        // Show notification
        if (newConversation.isGroup) {
          showNotification('info', `You were added to ${newConversation.name || 'a group'}`);
        } else {
          const otherMember = newConversation.members?.find((m: any) => m.userId !== currentUserId);
          if (otherMember) {
            showNotification('info', `New conversation with ${otherMember.user.displayName || 'someone'}`);
          }
        }
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
  const loadConversations = useCallback(async (skipLoadingState = false) => {
    if (!token || !currentUserId) {
      setIsLoading(false);
      return;
    }

    try {
      if (!skipLoadingState) {
        setIsLoading(true);
      }
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

      // Mark all unread messages as seen when opening the conversation
      const unreadMessages = data.filter(
        (msg) => msg.userId !== currentUserId && !msg.seenBy?.some((s) => s.userId === currentUserId)
      );

      console.log('[loadMessages] Marking', unreadMessages.length, 'messages as seen in conversation:', selectedConversation.id);

      // Mark each unread message as seen (API will broadcast via WebSocket)
      const markSeenPromises = unreadMessages.map((msg) =>
        messagesAPI.markMessageSeen(token, msg.id)
          .catch(error => {
            console.error('[loadMessages] Failed to mark message as seen:', error);
          })
      );

      // Wait for all to complete
      await Promise.all(markSeenPromises);

      // Update local messages with seen status immediately
      setMessages((prev) =>
        prev.map((msg) => {
          if (unreadMessages.some(unread => unread.id === msg.id)) {
            return {
              ...msg,
              seenBy: [
                ...(msg.seenBy || []),
                {
                  userId: currentUserId,
                  username: user?.user?.displayName || 'You',
                  seenAt: new Date().toISOString(),
                },
              ],
            };
          }
          return msg;
        })
      );

      // Update local unread count to 0 for this conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error: any) {
      console.error('[Messages] Failed to load messages:', error);
      showNotification('error', error.message || 'Failed to load messages');
    }
  }, [token, selectedConversation, currentUserId, sendMessage, showNotification, user]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !token || !selectedConversation || !currentUserId || isSending) {
      return;
    }

    const content = messageInput.trim();
    const replyTo = replyingTo;  // Capture reply state
    setMessageInput('');
    setReplyingTo(null);  // Clear reply state
    setIsSending(true);

    // Stop typing indicator
    handleTyping(false);

    try {
      const newMessage = await messagesAPI.sendMessage(token, {
        conversationId: selectedConversation.id,
        userId: currentUserId,
        content,
        replyToId: replyTo?.id,  // Include reply reference
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

      // Reload conversations to update last message without showing loading spinner
      loadConversations(true);
    } catch (error: any) {
      console.error('[Messages] Failed to send message:', error);
      showNotification('error', error.message || 'Failed to send message');
      setMessageInput(content); // Restore message on error
      if (replyTo) setReplyingTo(replyTo);  // Restore reply state on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle reply to message
  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo(message);
    // Focus input (optional - depends on your UI needs)
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Send media message
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !selectedConversation || !currentUserId) return;

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setMediaPreviewUrl(previewUrl);
      setShowMediaPreview(true);
    } catch (error: any) {
      console.error('[Messages] Failed to create preview:', error);
      showNotification('error', error.message || 'Failed to preview media');
    }
  };

  // Close media preview and cleanup
  const handleCloseMediaPreview = () => {
    setShowMediaPreview(false);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    setMediaPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send media with caption
  const handleSendMedia = async (caption: string, files: File[]) => {
    if (!files.length || !token || !selectedConversation || !currentUserId) return;

    setIsSending(true);
    try {
      // Upload all files and send as a single message
      const mediaMessage = await messagesAPI.uploadAndSendMultipleMedia(
        token,
        selectedConversation.id,
        files,
        caption.trim() || undefined
      );
      
      setMessages((prev) => [...prev, mediaMessage]);
      scrollToBottom();
      handleCloseMediaPreview();
    } catch (error: any) {
      console.error('[Messages] Failed to send media:', error);
      showNotification('error', error.message || 'Failed to send media');
    } finally {
      setIsSending(false);
    }
  };

  // Edit message handler
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!token || !newContent.trim()) return;

    try {
      const updatedMessage = await messagesAPI.editMessage(token, messageId, newContent);
      
      // Update local message state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: updatedMessage.content, isEdited: true, editedAt: updatedMessage.editedAt }
            : msg
        )
      );
      
      showNotification('success', 'Message edited');
    } catch (error: any) {
      console.error('[Messages] Failed to edit message:', error);
      showNotification('error', error.message || 'Failed to edit message');
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!token) return;

    try {
      if (forEveryone) {
        await messagesAPI.deleteMessageForEveryone(token, messageId);
        
        // Update local state - mark as deleted for everyone
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: 'This message was deleted', deletedForEveryone: true }
              : msg
          )
        );
      } else {
        await messagesAPI.deleteMessageForMe(token, messageId);
        
        // Remove message from local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
      
      showNotification('success', 'Message deleted');
    } catch (error: any) {
      console.error('[Messages] Failed to delete message:', error);
      showNotification('error', error.message || 'Failed to delete message');
    }
  };

  // Forward message handler
  const handleForwardMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setForwardingMessage(message);
      setShowForwardModal(true);
    }
  };

  // Forward to selected conversations
  const handleForwardToConversations = async (conversationIds: string[]) => {
    if (!token || !forwardingMessage || conversationIds.length === 0) return;

    try {
      await messagesAPI.forwardMessage(token, forwardingMessage.id, conversationIds);
      showNotification('success', `Message forwarded to ${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''}`);
      setShowForwardModal(false);
      setForwardingMessage(null);
    } catch (error: any) {
      console.error('[Messages] Failed to forward message:', error);
      showNotification('error', error.message || 'Failed to forward message');
    }
  };

  // Star message handler
  const handleStarMessage = async (messageId: string) => {
    if (!token) return;

    try {
      await messagesAPI.starMessage(token, messageId);
      
      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStarred: true } : msg
        )
      );
      
      showNotification('success', 'Message starred');
    } catch (error: any) {
      console.error('[Messages] Failed to star message:', error);
      showNotification('error', error.message || 'Failed to star message');
    }
  };

  // Unstar message handler
  const handleUnstarMessage = async (messageId: string) => {
    if (!token) return;

    try {
      await messagesAPI.unstarMessage(token, messageId);
      
      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isStarred: false } : msg
        )
      );
      
      showNotification('success', 'Message unstarred');
    } catch (error: any) {
      console.error('[Messages] Failed to unstar message:', error);
      showNotification('error', error.message || 'Failed to unstar message');
    }
  };

  // Add reaction handler
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!token || !currentUserId) return;

    try {
      await messagesAPI.addReaction(token, messageId, emoji);
      
      // Update local state optimistically
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existingReaction = reactions.find((r) => r.emoji === emoji);
            
            if (existingReaction) {
              // User already reacted, update the reaction
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, userReacted: true }
                    : r
                ),
              };
            } else {
              // New reaction
              return {
                ...msg,
                reactions: [
                  ...reactions,
                  { emoji, count: 1, users: [{ id: currentUserId, displayName: user?.user?.displayName || '', avatarUrl: user?.user?.avatarUrl || '' }], userReacted: true },
                ],
              };
            }
          }
          return msg;
        })
      );
    } catch (error: any) {
      console.error('[Messages] Failed to add reaction:', error);
      showNotification('error', error.message || 'Failed to add reaction');
    }
  };

  // Remove reaction handler
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    if (!token) return;

    try {
      await messagesAPI.removeReaction(token, messageId, emoji);
      
      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const reactions = (msg.reactions || [])
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, userReacted: false }
                  : r
              )
              .filter((r) => r.count > 0);
            
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    } catch (error: any) {
      console.error('[Messages] Failed to remove reaction:', error);
      showNotification('error', error.message || 'Failed to remove reaction');
    }
  };

  // View edit history handler
  const handleViewHistory = async (messageId: string) => {
    if (!token) return;

    try {
      const history = await messagesAPI.getEditHistory(token, messageId);
      setEditHistoryData(history);
      setShowEditHistoryModal(true);
    } catch (error: any) {
      console.error('[Messages] Failed to get edit history:', error);
      showNotification('error', error.message || 'Failed to load edit history');
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

  // Create group conversation
  const handleCreateGroup = async () => {
    if (!token || !currentUserId || isCreatingGroup) return;
    if (!groupName.trim()) {
      showNotification('error', 'Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      showNotification('error', 'Please select at least one member');
      return;
    }

    try {
      setIsCreatingGroup(true);
      const conversation = await messagesAPI.createGroupConversation(
        token,
        groupName.trim(),
        selectedMembers
      );
      setSelectedConversation(conversation);
      setShowGroupCreate(false);
      setGroupName('');
      setSelectedMembers([]);
      loadConversations();
      showNotification('success', 'Group created successfully');
    } catch (error: any) {
      console.error('[Messages] Failed to create group:', error);
      showNotification('error', error.message || 'Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async () => {
    if (!token || !currentUserId || !selectedConversation || isDeletingConversation) return;

    try {
      setIsDeletingConversation(true);
      await messagesAPI.deleteConversation(token, selectedConversation.id, currentUserId);
      setSelectedConversation(null);
      setShowDeleteConfirm(false);
      loadConversations();
      showNotification('success', 'Conversation deleted successfully');
    } catch (error: any) {
      console.error('[Messages] Failed to delete conversation:', error);
      showNotification('error', error.message || 'Failed to delete conversation');
    } finally {
      setIsDeletingConversation(false);
    }
  };

  // Update group name
  const handleUpdateGroupName = async (conversationId: string, newName: string) => {
    if (!token || !currentUserId) return;

    try {
      const updatedConversation = await messagesAPI.updateGroupName(token, conversationId, newName, currentUserId);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, name: updatedConversation.name }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, name: updatedConversation.name } : null);
      }

      showNotification('success', 'Group name updated successfully');
    } catch (error: any) {
      console.error('[Messages] Failed to update group name:', error);
      showNotification('error', error.message || 'Failed to update group name');
      throw error;
    }
  };

  // Update group avatar
  const handleUpdateGroupAvatar = async (conversationId: string, file: File) => {
    if (!token || !currentUserId) return;

    try {
      const result = await messagesAPI.uploadGroupAvatar(token, conversationId, file);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, avatarUrl: result.conversation.avatarUrl }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? { ...prev, avatarUrl: result.conversation.avatarUrl } : null);
      }

      showNotification('success', 'Group avatar updated successfully');
    } catch (error: any) {
      console.error('[Messages] Failed to update group avatar:', error);
      showNotification('error', error.message || 'Failed to update group avatar');
      throw error;
    }
  };

  // Remove member from group
  const handleRemoveMember = async (conversationId: string, userId: string) => {
    if (!token || !currentUserId) return;

    try {
      await messagesAPI.removeMember(token, conversationId, userId, currentUserId);

      // Reload conversations and messages to update UI
      await loadConversations();

      if (selectedConversation?.id === conversationId) {
        const messages = await messagesAPI.getMessages(token, conversationId, 50);
        setMessages(messages);
      }

      showNotification('success', 'Member removed successfully');
    } catch (error: any) {
      console.error('[Messages] Failed to remove member:', error);
      showNotification('error', error.message || 'Failed to remove member');
      throw error;
    }
  };

  // Handle add members - open the add members modal
  const handleAddMembersToGroup = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedGroupConversation(conversation);
      setShowGroupMembers(false);
      loadMutualFollowers(); // Load available users
      setShowAddMembers(true);
    }
  };

  // Add members to group
  const handleAddMembersSubmit = async (userIds: string[]) => {
    if (!selectedGroupConversation || !token || !currentUserId) return;

    try {
      await messagesAPI.addMembers(token, selectedGroupConversation.id, userIds, currentUserId);
      showNotification('success', `Added ${userIds.length} member(s) to group`);

      // Reload conversations to get updated data
      await loadConversations();

      // Find the updated conversation
      const updatedConversations = await messagesAPI.getUserConversations(token, currentUserId);
      const updatedConv = updatedConversations.find(c => c.id === selectedGroupConversation.id);

      // Update selected conversation and group conversation
      if (updatedConv) {
        setSelectedConversation(updatedConv);
        setSelectedGroupConversation(updatedConv);
      }

      // Close add members modal and reopen group members drawer with updated data
      setShowAddMembers(false);
      setShowGroupMembers(true);
    } catch (error) {
      console.error('[Messages] Failed to add members:', error);
      throw error; // Let modal handle error display
    }
  };

  // Leave group
  const handleLeaveGroup = async (conversationId: string) => {
    if (!token || !currentUserId) return;

    try {
      await messagesAPI.leaveGroup(token, conversationId, currentUserId);
      showNotification('success', 'Left group successfully');

      // Close group members drawer
      setShowGroupMembers(false);

      // If we're viewing this conversation, deselect it
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }

      // Reload conversations
      await loadConversations();
    } catch (error) {
      console.error('[Messages] Failed to leave group:', error);
      showNotification('error', 'Failed to leave group');
    }
  };

  // Toggle member selection
  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle profile click
  const handleProfileClick = async (conv: ChatConversation) => {
    if (conv.isGroup) return; // Don't open profile for groups
    const otherMember = conv.members.find(m => m.userId !== currentUserId);
    if (otherMember) {
      setSelectedProfileUser(otherMember.user);
      setShowProfileDrawer(true);
      setProfileLoading(true);
      setProfileData(null);

      try {
        // Try to fetch teacher profile first
        try {
          const teacherData = await apiClient.get(`/api/teachers/user/${otherMember.userId}`);
          if (teacherData && typeof teacherData === 'object') {
            setProfileData({ ...teacherData, type: 'teacher' });
          }
        } catch (teacherError) {
          // If not a teacher, try student profile
          try {
            const studentData = await apiClient.get(`/api/students/user/${otherMember.userId}`);
            if (studentData && typeof studentData === 'object') {
              setProfileData({ ...studentData, type: 'student' });
            }
          } catch (studentError) {
            // Just show basic user info
            setProfileData({ user: otherMember.user, type: 'user' });
          }
        }
      } catch (error) {
        console.error('[Messages] Failed to load profile:', error);
        showNotification('error', 'Failed to load profile details');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Handle group members click
  const handleGroupMembersClick = (conv: ChatConversation) => {
    if (!conv.isGroup) return;
    setSelectedGroupConversation(conv);
    setShowGroupMembers(true);
  };


  // Load available users for new chat
  const loadAvailableUsers = useCallback(async () => {
    if (!token) return;

    setIsLoadingMutualFollowers(true);
    try {
      const users = await messagesAPI.getMutualFollowers(token);
      console.log('[Messages] Available users loaded:', users);
      // Filter out current user
      setAvailableUsers(users.filter((u) => u.id !== currentUserId));
    } catch (error: any) {
      console.error('[Messages] Failed to load users:', error);
      showNotification('error', 'Failed to load available users');
    } finally {
      setIsLoadingMutualFollowers(false);
    }
  }, [token, currentUserId, showNotification]);

  // Scroll to replied message
  const handleScrollToMessage = useCallback((messageId: string) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      // Remove highlight after animation
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  }, []);

  // Load mutual followers for group creation
  const loadMutualFollowers = useCallback(async () => {
    if (!token) return;

    setIsLoadingMutualFollowers(true);
    try {
      const users = await messagesAPI.getMutualFollowers(token);
      console.log('[Messages] Mutual followers loaded:', users);
      // Filter out current user (should already be filtered on backend, but just in case)
      setAvailableUsers(users.filter((u) => u.id !== currentUserId));
    } catch (error: any) {
      console.error('[Messages] Failed to load mutual followers:', error);
      showNotification('error', 'Failed to load available users');
    } finally {
      setIsLoadingMutualFollowers(false);
    }
  }, [token, currentUserId, showNotification]);

  // Typing indicator with debouncing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedConversation || !currentUserId) {
        console.log('[Messages] handleTyping aborted:', { hasConversation: !!selectedConversation, currentUserId });
        return;
      }
      console.log('[Messages] handleTyping called:', { isTyping, conversationId: selectedConversation.id, currentUserId });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        // When user starts typing, mark all unread messages as seen
        if (!isTypingRef.current && token) {
          const unreadMessages = messages.filter(
            (msg) => msg.userId !== currentUserId && !msg.seenBy?.some((s) => s.userId === currentUserId)
          );

          if (unreadMessages.length > 0) {
            // Mark all unread messages as seen immediately
            unreadMessages.forEach((msg) => {
              messagesAPI.markMessageSeen(token, msg.id).catch(error => {
                console.error('[Messages] Failed to mark message as seen:', error);
              });
            });

            // Update local state
            setMessages((prev) =>
              prev.map((msg) => {
                if (unreadMessages.some(unread => unread.id === msg.id)) {
                  return {
                    ...msg,
                    seenBy: [
                      ...(msg.seenBy || []),
                      {
                        userId: currentUserId,
                        username: user?.user?.displayName || 'You',
                        seenAt: new Date().toISOString(),
                      },
                    ],
                  };
                }
                return msg;
              })
            );

            // Refresh conversation list without showing loading spinner
            setTimeout(() => loadConversations(true), 100);
          }
        }

        // Send typing start immediately if not already typing
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          console.log('[Messages] Sending typing START event');
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
          console.log('[Messages] Sending typing STOP event (timeout)');
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
          console.log('[Messages] Sending typing STOP event (manual)');
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
    [selectedConversation, currentUserId, sendMessage, messages, token, user, setMessages, loadConversations]
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
      // Mark unread messages as seen immediately
      const unreadMessages = messages.filter(
        (msg) => msg.userId !== currentUserId && !msg.seenBy?.some((s) => s.userId === currentUserId)
      );

      if (unreadMessages.length > 0) {
        // Mark all unread messages as seen
        unreadMessages.forEach((msg) => {
          messagesAPI.markMessageSeen(token, msg.id).catch(error => {
            console.error('[Messages] Failed to mark message as seen:', error);
          });
        });

        // Immediately update local state to reflect read status
        setMessages((prev) =>
          prev.map((msg) => {
            if (unreadMessages.some(unread => unread.id === msg.id)) {
              return {
                ...msg,
                seenBy: [
                  ...(msg.seenBy || []),
                  {
                    userId: currentUserId,
                    username: user?.user?.displayName || 'You',
                    seenAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return msg;
          })
        );

        // Refresh conversation list immediately to update unread counts
        setTimeout(() => loadConversations(), 100);
      }
    }
  }, [selectedConversation, messages, token, currentUserId, user, loadConversations]);

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
    if (conv.isGroup) {
      // Return group avatar if available
      return conv.avatarUrl || null;
    }
    const otherUser = conv.members.find((m) => m.userId !== currentUserId);
    return otherUser?.user.avatarUrl || null;
  };

  const handleAvatarClick = async (userId: string) => {
    // Determine the user to show
    let userToShow: ChatUser | undefined;

    // Check members list of the current conversation
    if (selectedConversation) {
      const member = selectedConversation.members.find(m => m.userId === userId);
      if (member) {
        userToShow = member.user;
      }
    }

    if (!userToShow) return;

    // Set the user and open profile drawer
    setSelectedProfileUser(userToShow);
    setShowProfileDrawer(true);

    // Fetch detailed profile data
    setProfileLoading(true);
    try {
      const data = await messagesAPI.getUserById(token!, userId);
      setProfileData(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfileData({});
    } finally {
      setProfileLoading(false);
    }
  };

  // Get unread count for a conversation
  const getUnreadCount = (conv: ChatConversation): number => {
    // Use unreadCount from conversation object (set by backend or WebSocket)
    if (typeof conv.unreadCount !== 'undefined') {
      console.log('[getUnreadCount] Using persisted unread count for conversation:', conv.id, 'Count:', conv.unreadCount);
      return conv.unreadCount;
    }

    // Fallback to calculating from messages (legacy behavior)
    if (!conv.messages) {
      console.log('[getUnreadCount] No messages for conversation:', conv.id);
      return 0;
    }
    const unreadMessages = conv.messages.filter(
      (msg: any) => msg.userId !== currentUserId && !msg.seenBy?.some((s: any) => s.userId === currentUserId)
    );
    console.log('[getUnreadCount] Calculated from messages - Conversation:', conv.id, 'Unread:', unreadMessages.length, 'Total messages:', conv.messages.length);
    return unreadMessages.length;
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
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden antialiased">
      {/* Conversations Sidebar */}
      <ConversationsList
        user={user}
        isConnected={isConnected}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        filteredConversations={filteredConversations}
        selectedConversation={selectedConversation}
        currentUserId={currentUserId!}
        onSelectConversation={setSelectedConversation}
        onShowUserSearch={() => setShowUserSearch(true)}
        onShowGroupCreate={() => {
          loadMutualFollowers();
          setShowGroupCreate(true);
        }}
        onClose={onClose}
        getUnreadCount={getUnreadCount}
        onGroupClick={handleGroupMembersClick}
      />

      {/* Chat View */}
      <main className={`flex-1 flex flex-col bg-black relative transition-all duration-300 ${selectedConversation ? 'flex' : 'hidden md:flex items-center justify-center'
        }`}>
        {selectedConversation ? (
          <>
            <ChatHeader
              selectedConversation={selectedConversation}
              currentUserId={currentUserId!}
              isConnected={isConnected}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              onBack={() => setSelectedConversation(null)}
              onProfileClick={() => handleProfileClick(selectedConversation)}
              onGroupMembersClick={() => handleGroupMembersClick(selectedConversation)}
              onDeleteClick={() => setShowDeleteConfirm(true)}
              getConversationName={getConversationName}
              getConversationAvatar={getConversationAvatar}
            />

            <MessagesList
              messages={messages}
              currentUserId={currentUserId!}
              typingUsers={typingUsers}
              messagesEndRef={messagesEndRef}
              conversation={selectedConversation}
              onAvatarClick={handleAvatarClick}
              onReplyToMessage={handleReplyToMessage}
              messageRefs={messageRefs}
              highlightedMessageId={highlightedMessageId}
              onScrollToMessage={handleScrollToMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onForwardMessage={handleForwardMessage}
              onStarMessage={handleStarMessage}
              onUnstarMessage={handleUnstarMessage}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
              onViewHistory={handleViewHistory}
            />

            <MessageInput
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              isSending={isSending}
              onSendMessage={handleSendMessage}
              onFileSelect={handleFileSelect}
              onTyping={handleTyping}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
          </>
        ) : (
          <EmptyChatView />
        )}
      </main>

      {/* Modals */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        availableUsers={availableUsers}
        isStartingChat={isStartingChat}
        onStartChat={handleStartChat}
      />

      <GroupCreateModal
        isOpen={showGroupCreate}
        onClose={() => {
          setShowGroupCreate(false);
          setGroupName('');
          setSelectedMembers([]);
        }}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedMembers={selectedMembers}
        toggleMemberSelection={toggleMemberSelection}
        availableUsers={availableUsers}
        isLoadingMutualFollowers={isLoadingMutualFollowers}
        isCreatingGroup={isCreatingGroup}
        onCreateGroup={handleCreateGroup}
      />

      <GroupMembersDrawer
        isOpen={showGroupMembers}
        onClose={() => setShowGroupMembers(false)}
        selectedGroupConversation={selectedGroupConversation}
        currentUserId={currentUserId!}
        onUpdateGroupName={handleUpdateGroupName}
        onUpdateGroupAvatar={handleUpdateGroupAvatar}
        onRemoveMember={handleRemoveMember}
        onAddMembers={handleAddMembersToGroup}
        onLeaveGroup={handleLeaveGroup}
      />

      <AddMembersModal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        conversationId={selectedGroupConversation?.id || ''}
        existingMemberIds={selectedGroupConversation?.members.map(m => m.userId) || []}
        onAddMembers={handleAddMembersSubmit}
        availableUsers={availableUsers}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConversation}
        isDeletingConversation={isDeletingConversation}
      />

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={showMediaPreview}
        onClose={handleCloseMediaPreview}
        onSend={handleSendMedia}
        initialFile={selectedFile}
      />

      {/* Forward Message Modal */}
      {showForwardModal && forwardingMessage && (
        <ForwardMessageModal
          message={forwardingMessage}
          conversations={conversations.filter((c) => c.id !== selectedConversation?.id)}
          currentUserId={currentUserId!}
          onForward={handleForwardToConversations}
          onClose={() => {
            setShowForwardModal(false);
            setForwardingMessage(null);
          }}
        />
      )}

      {/* Edit History Modal */}
      {showEditHistoryModal && editHistoryData && (
        <EditHistoryModal
          current={editHistoryData.current}
          history={editHistoryData.history}
          onClose={() => {
            setShowEditHistoryModal(false);
            setEditHistoryData(null);
          }}
        />
      )}

      {/* Profile Drawer */}
      <Drawer
        isOpen={showProfileDrawer}
        onClose={() => {
          setShowProfileDrawer(false);
          setProfileData(null);
        }}
        title={profileData?.type === 'teacher' ? 'Teacher Profile' : profileData?.type === 'student' ? 'Student Profile' : 'Profile'}
        width="md"
      >
        <ProfileDrawerContent
          selectedProfileUser={selectedProfileUser}
          profileLoading={profileLoading}
          profileData={profileData}
        />
      </Drawer>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thumb-zinc-800::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .scrollbar-thumb-zinc-800::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}} />
    </div>
  );
}

/**
 * Home Page - AI Chat Interface
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { aiAPI, type Conversation, type Message } from '@/lib/ai-api';
import { Send, Plus, Trash2, Search, Menu, X, MessageSquare, Loader2, User, Database, Coins } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { VectorVisualizer } from '@/components/VectorVisualizer';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default
  const [searchQuery, setSearchQuery] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedEmbedding, setExpandedEmbedding] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.user?.id) {
      loadConversations();
    }
  }, [user]);

  // Restore conversation from URL on mount
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId && user?.user?.id && conversations.length > 0) {
      // Check if conversation exists in loaded conversations
      const conv = conversations.find(c => c.id === chatId);
      if (conv) {
        setCurrentConversation(conv);
      } else {
        // Try to load conversation directly
        aiAPI.getConversation(chatId).then(conv => {
          setCurrentConversation(conv);
        }).catch(err => {
          console.error('Failed to load conversation from URL:', err);
          // Clear invalid chat ID from URL
          router.push('/', { scroll: false });
        });
      }
    }
  }, [conversations, searchParams, user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileMenu]);

  const loadConversations = async () => {
    try {
      const convs = await aiAPI.getConversations(user!.user.id);
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await aiAPI.getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const startNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setInputMessage('');
    router.push('/', { scroll: false });
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const confirmDeleteConversation = async () => {
    if (!deleteConversationId) return;

    try {
      await aiAPI.deleteConversation(deleteConversationId);
      setConversations(prev => prev.filter(c => c.id !== deleteConversationId));
      if (currentConversation?.id === deleteConversationId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeleteConversationId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentConversation?.id || 'new',
      role: 'user',
      content: userMessage,
      sequenceNumber: messages.length,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      // Call API to get full response
      const response = await aiAPI.generate({
        prompt: userMessage,
        conversationId: currentConversation?.id, // Use existing conversation ID if available
        userId: user.user.id,
        teacherId: user.user.role === 'TEACHER' ? user.user.id : undefined,
        studentId: user.user.role === 'STUDENT' ? user.user.id : undefined,
        useRAG: true,
        sessionType: 'chat',
        webSearch: webSearchEnabled,
      });

      // If this is a new conversation, update current conversation immediately
      if (!currentConversation) {
        const newConv = await aiAPI.getConversation(response.conversationId);
        setCurrentConversation(newConv);
        await loadConversations();
        // Update URL immediately to prevent duplicate messages
        router.push(`/?chat=${response.conversationId}`, { scroll: false });
      }

      // Create streaming message placeholder
      const streamMsgId = `stream-${Date.now()}`;
      const fullResponse = response.response;
      
      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: streamMsgId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: '',
        sequenceNumber: messages.length + 1,
        createdAt: new Date(),
      }]);

      // Stream the response character by character
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          const chunkSize = Math.min(5, fullResponse.length - currentIndex);
          currentIndex += chunkSize;
          const partialText = fullResponse.substring(0, currentIndex);
          
          // Update only the streaming message content
          setMessages(prev => 
            prev.map(msg => 
              msg.id === streamMsgId
                ? { ...msg, content: partialText }
                : msg
            )
          );
        } else {
          // Streaming complete - reload messages to get embeddings
          clearInterval(streamInterval);
          setIsLoading(false);
          
          // Reload messages from server to get full data including embeddings
          // Only reload if we already had a conversation (to get embeddings)
          // For new conversations, we already have the messages in state
          if (currentConversation) {
            loadMessages(response.conversationId);
          }
        }
      }, 30);

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temporary message on error
      setMessages(prev => prev.slice(0, -1));
      alert('Failed to send message. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConversationId(convId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(c => 
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar - Mobile overlay or desktop fixed */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarOpen ? 'md:w-80' : 'w-0 md:w-0'}
        fixed md:relative z-30 h-full w-80
        transition-all duration-300 
        border-r border-white/10 bg-black
        flex flex-col overflow-hidden
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Knovera</h2>
          <button
            onClick={startNewChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="New chat"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/40" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`w-full p-4 hover:bg-white/5 transition-colors border-b border-white/5 flex items-start gap-3 group ${
                  currentConversation?.id === conv.id ? 'bg-white/10' : ''
                }`}
              >
                <MessageSquare size={18} className="text-white/60 flex-shrink-0 mt-1" />
                <div
                  onClick={() => setCurrentConversation(conv)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="font-medium text-sm truncate">
                    {conv.title || conv.topic || 'New conversation'}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {new Date(conv.lastActiveAt).toLocaleDateString()}
                  </div>
                </div>
                <div
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-red-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Profile & Server Status */}
        <div className="border-t border-white/10 relative">
          {user && (
            <div className="p-3">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                  {user.user.avatarUrl ? (
                    <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-white font-semibold">
                        {user.user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{user.user.displayName}</div>
                  <div className="text-xs text-white/40">{user.user.role}</div>
                </div>
              </div>
              
              {/* Profile Menu Popup */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-black border border-white/20 rounded-lg shadow-xl overflow-hidden z-40">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowProfileMenu(false);
                  <><div className="h-px bg-white/10"></div><button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        } }
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button></>
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <div className="h-px bg-white/10"></div>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
              
              <div className="h-px bg-white/10 mb-2"></div>
              <div className="flex items-center gap-2 text-xs px-2">
                <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white/60">Server {serverStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Header */}
        <div className="h-12 border-b border-white/10 flex items-center px-3 gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1"></div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <MessageSquare size={24} className="text-white/40 md:w-8 md:h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-white/60 text-sm md:text-base max-w-md px-4">
                Ask me anything! I can help you with your studies, answer questions, or just chat.
              </p>
            </div>
          ) : (
            <div className="w-full px-3 md:px-6 lg:px-12 py-4 md:py-6">
              {messages.map((msg, idx) => (
                <div key={msg.id}>
                  <div
                    className={`mb-4 md:mb-6 flex gap-2 md:gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-semibold">AI</span>
                      </div>
                    )}
                    
                    <div className={`flex-1 ${msg.role === 'user' ? 'max-w-[85%] md:max-w-2xl' : ''}`}>
                      {/* Sender name in gray */}
                      {msg.role === 'assistant' && (
                        <div className="text-xs text-gray-500 mb-1 ml-1">Assistant</div>
                      )}
                      {msg.role === 'user' && (
                        <div className="text-xs text-gray-500 mb-1 mr-1 text-right">You</div>
                      )}
                      
                      <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                        msg.role === 'user'
                          ? 'bg-gray-700 text-white ml-auto'
                          : 'bg-transparent text-white'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="text-sm md:text-base markdown-content">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                            {msg.content}
                          </div>
                        )}
                      </div>
                      
                      {/* Metadata section with tokens and vector embeddings */}
                      <div className="mt-2 ml-2 md:ml-4 space-y-2">
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          {msg.tokensUsed && (
                            <div className="flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              <span>{msg.tokensUsed} tokens</span>
                            </div>
                          )}
                          {msg.embedding && (
                            <button
                              onClick={() => {
                                setExpandedEmbedding(expandedEmbedding === msg.id ? null : msg.id);
                              }}
                              className="flex items-center gap-1 hover:text-white/60 transition-colors cursor-pointer"
                            >
                              <Database className="w-3 h-3" />
                              <span>{expandedEmbedding === msg.id ? 'hide' : 'show'} vector</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Inline Vector Visualization */}
                        {expandedEmbedding === msg.id && msg.embedding && (() => {
                          try {
                            const embedding = JSON.parse(msg.embedding);
                            if (!Array.isArray(embedding)) return null;
                            
                            // Find previous assistant message for comparison
                            let previousEmbedding: number[] | undefined;
                            for (let i = idx - 1; i >= 0; i--) {
                              if (messages[i].role === 'assistant' && messages[i].embedding) {
                                try {
                                  const prevEmb = JSON.parse(messages[i].embedding!);
                                  if (Array.isArray(prevEmb)) {
                                    previousEmbedding = prevEmb;
                                    break;
                                  }
                                } catch {}
                              }
                            }
                            
                            return (
                              <VectorVisualizer 
                                data={embedding} 
                                compareTo={previousEmbedding}
                              />
                            );
                          } catch (error) {
                            return (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-xs text-red-400">
                                Error parsing embedding
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {msg.role === 'user' && user?.user?.avatarUrl && (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                        <img src={user.user.avatarUrl} alt="You" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  {/* Divider between messages */}
                  {idx < messages.length - 1 && (
                    <div className="border-t border-white/10 my-4 md:my-6"></div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-4 md:mb-8 flex gap-2 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-2xl px-3 py-2 md:px-4 md:py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-2 md:p-3 safe-area-bottom">
          <div className="w-full px-2 md:px-4 lg:px-8">
            <div className="flex gap-2 items-end">
              <button
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  webSearchEnabled 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
                title={webSearchEnabled ? 'Web search enabled' : 'Web search disabled'}
              >
                <Search size={16} />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    // Auto-resize textarea
                    if (inputRef.current) {
                      inputRef.current.style.height = '38px';
                      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-white/30 transition-colors scrollbar-hide"
                  style={{ minHeight: '38px', maxHeight: '120px', overflow: 'hidden' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your chats."
        confirmText="Logout"
        cancelText="Stay"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        isOpen={deleteConversationId !== null}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteConversation}
        onCancel={() => setDeleteConversationId(null)}
      />
    </div>
  );
}


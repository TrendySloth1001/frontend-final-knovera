/**
 * Home Page - AI Chat Interface
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { aiAPI, type Conversation, type Message } from '@/lib/ai-api';
import { Send, Plus, Trash2, Search, Menu, X, MessageSquare, Loader2, User, Database, Coins, BookOpen, ChevronDown, HelpCircle, Copy, Check, Wrench, Brain, Globe } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ThinkingBlock from '@/components/ThinkingBlock';
import { VectorVisualizer } from '@/components/VectorVisualizer';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import ModelSelector from '@/components/ModelSelector';
import QuizGenerator from '@/components/QuizGenerator';
import QuizView from '@/components/QuizView';
import QuizResults from '@/components/QuizResults';

export default function Home() {
  const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default
  const [searchQuery, setSearchQuery] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('online');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedEmbedding, setExpandedEmbedding] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const [isConversationsExpanded, setIsConversationsExpanded] = useState(true);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [enableQuiz, setEnableQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});
  const [loadedQuizzes, setLoadedQuizzes] = useState<Record<string, any>>({});
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 5,
    questionTypes: ['mcq', 'true-false'] as string[],
    difficulty: 'medium' as string,
    description: ''
  });
  const [showQuizConfigForm, setShowQuizConfigForm] = useState(false);
  const [quizPrompt, setQuizPrompt] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  // Load selected model from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel) {
      console.log('[Chat] Loading saved model from localStorage:', savedModel);
      setSelectedModel(savedModel);
    }
  }, []);
  
  // Calculate total tokens used in conversation
  const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0);
  
  // Log when model changes and save to localStorage
  const handleModelChange = (model: string) => {
    console.log('[Chat] Model changed to:', model);
    setSelectedModel(model);
    localStorage.setItem('selectedModel', model);
  };
  
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

  // Load quizzes when token becomes available and there are messages with quizzes
  useEffect(() => {
    if (token && messages.length > 0) {
      const quizMessages = messages.filter((m: Message) => m.messageType === 'quiz' && m.quizSessionId);
      if (quizMessages.length > 0) {
        console.log('[Quiz] Token available, loading quizzes for', quizMessages.length, 'messages');
        loadQuizzesForMessages(quizMessages);
      }
    }
  }, [token, messages]);

  const loadQuizzesForMessages = async (quizMessages: Message[]) => {
    const quizzesToLoad: Record<string, any> = {};
    
    for (const msg of quizMessages) {
      if (msg.quizSessionId && !loadedQuizzes[msg.quizSessionId]) {
        console.log('[Quiz] Fetching quiz data for:', msg.quizSessionId);
        try {
          const response = await fetch(`http://localhost:3001/api/quizzes/${msg.quizSessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const quiz = await response.json();
            const quizData = quiz.data || quiz;
            console.log('[Quiz] Loaded quiz data for', msg.quizSessionId);
            quizzesToLoad[msg.quizSessionId] = quizData;
          } else {
            console.error('[Quiz] Failed to load quiz:', msg.quizSessionId, response.status);
          }
        } catch (error) {
          console.error('[Quiz] Error loading quiz:', msg.quizSessionId, error);
        }
      }
    }
    
    // Update all loaded quizzes at once
    if (Object.keys(quizzesToLoad).length > 0) {
      console.log('[Quiz] Setting loaded quizzes:', Object.keys(quizzesToLoad));
      setLoadedQuizzes(prev => ({
        ...prev,
        ...quizzesToLoad
      }));
      // Scroll to bottom after quizzes load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (user?.user?.id) {
      loadConversations();
    }
  }, [user]);

  // Load conversation from URL parameter
  useEffect(() => {
    if (!user?.user?.id) return;

    if (conversationId && conversationId !== 'new') {
      // Only load if it's a different conversation
      if (currentConversation?.id !== conversationId) {
        // Try to load conversation directly
        aiAPI.getConversation(conversationId).then(conv => {
          setCurrentConversation(conv);
          // Load messages immediately
          return aiAPI.getMessages(conversationId);
        }).then(msgs => {
          if (msgs) {
            setMessages(msgs);
          }
        }).catch(err => {
          console.error('Failed to load conversation from URL:', err);
          // If conversation not found, redirect to new chat
          router.push('/chat/new');
        });
      }
    } else if (conversationId === 'new') {
      // Clear current conversation for new chat
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [conversationId, user?.user?.id]);

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
      console.log('[Messages] Loaded', msgs.length, 'messages');
      
      // Log quiz messages
      const quizMessages = msgs.filter((m: Message) => m.messageType === 'quiz');
      console.log('[Messages] Found', quizMessages.length, 'quiz messages:', quizMessages.map((m: any) => ({
        id: m.id,
        quizSessionId: m.quizSessionId,
        messageType: m.messageType
      })));
      
      setMessages(msgs);
      // Quiz loading will happen in useEffect when token is available
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const startNewChat = () => {
    router.push('/chat/new');
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

    // If quiz mode is enabled, add user message and show config form as AI response
    if (enableQuiz && conversationId && conversationId !== 'new') {
      const userMessage = inputMessage.trim();
      
      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        conversationId: conversationId,
        role: 'user',
        content: userMessage,
        sequenceNumber: messages.length + 1,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Store prompt and show config form
      setQuizPrompt(userMessage);
      setShowQuizConfigForm(true);
      setInputMessage('');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Use conversationId from URL as source of truth
    const currentConvId = conversationId !== 'new' ? conversationId : undefined;
    
    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: currentConvId || 'new',
      role: 'user',
      content: userMessage,
      sequenceNumber: messages.length,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      console.log('[Chat] Sending message with model:', selectedModel);
      
      // Call API to get full response - use conversationId from URL
      const response = await aiAPI.generate({
        prompt: userMessage,
        conversationId: currentConvId, // Use conversation ID from URL if it exists
        userId: user.user.id,
        teacherId: user.user.role === 'TEACHER' ? user.user.id : undefined,
        studentId: user.user.role === 'STUDENT' ? user.user.id : undefined,
        useRAG: true,
        sessionType: 'chat',
        webSearch: webSearchEnabled,
        model: selectedModel,
      });

      console.log('[Chat] API Response:', { 
        requestConvId: currentConvId,
        responseConvId: response.conversationId, 
        urlConvId: conversationId,
        isNewChat: conversationId === 'new'
      });

      // If this was a new chat, update URL immediately
      if (conversationId === 'new' && response.conversationId) {
        router.replace(`/chat/${response.conversationId}`);
        // Reload conversations list in background
        loadConversations();
      }

      // Create streaming message placeholder
      const streamMsgId = `stream-${Date.now()}`;
      const fullResponse = response.response;
      
      console.log('[Chat] Response received:', {
        hasThinking: !!response.thinking,
        thinkingPreview: response.thinking?.substring(0, 100),
        contentPreview: fullResponse.substring(0, 100)
      });
      
      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: streamMsgId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: '',
        thinking: response.thinking,
        tokensUsed: response.tokensUsed,
        sequenceNumber: messages.length + 1,
        createdAt: new Date(),
      }]);

      // Hide loading indicator once streaming starts
      setIsLoading(false);

      // Stream the response character by character
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          const chunkSize = Math.min(3, fullResponse.length - currentIndex);
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
          loadMessages(response.conversationId);
        }
      }, 50);

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

  const handleQuizGenerated = async (quizSessionId: string) => {
    try {
      console.log('[Quiz] Loading quiz with ID:', quizSessionId);
      const response = await fetch(`http://localhost:3001/api/quizzes/${quizSessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch quiz:', response.status, errorText);
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }
      const quiz = await response.json();
      console.log('[Quiz] Raw API response:', JSON.stringify(quiz, null, 2));
      
      // Handle both direct data and wrapped data
      const quizData = quiz.data || quiz;
      console.log('[Quiz] Quiz data after unwrap:', JSON.stringify(quizData, null, 2));
      
      // Validate quiz data
      if (!quizData.questions || quizData.questions.length === 0) {
        console.error('[Quiz] Invalid quiz data - no questions:', quizData);
        throw new Error('Quiz has no questions');
      }
      
      console.log('[Quiz] Loading quiz inline with', quizData.questions.length, 'questions');
      setLoadedQuizzes(prev => ({
        ...prev,
        [quizSessionId]: quizData
      }));
      setEnableQuiz(false);
      
      // Wait a bit for backend to create the message, then reload
      setTimeout(() => {
        if (conversationId && conversationId !== 'new') {
          console.log('[Quiz] Reloading messages to show quiz');
          loadMessages(conversationId);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert(`Failed to load quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleQuizAnswerChange = (quizSessionId: string, questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizSessionId]: {
        ...(prev[quizSessionId] || {}),
        [questionId]: answer
      }
    }));
  };

  const handleInlineQuizSubmit = async (quizSessionId: string) => {
    const answers = quizAnswers[quizSessionId];
    if (!answers) {
      alert('Please answer at least one question');
      return;
    }

    try {
      // Submit the quiz
      const submitResponse = await fetch(`http://localhost:3001/api/quizzes/${quizSessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      if (!submitResponse.ok) throw new Error('Failed to submit quiz');
      const results = await submitResponse.json();
      console.log('[Quiz Submit] Quiz submitted successfully:', results.data);
      
      // Refetch the complete quiz data to get all answer details and explanations
      const quizResponse = await fetch(`http://localhost:3001/api/quizzes/${quizSessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!quizResponse.ok) throw new Error('Failed to fetch quiz results');
      const quizData = await quizResponse.json();
      const completeQuizData = quizData.data || quizData;
      console.log('[Quiz Submit] Loaded complete quiz results:', completeQuizData);
      
      // Update the loaded quiz with complete results
      setLoadedQuizzes(prev => ({
        ...prev,
        [quizSessionId]: completeQuizData
      }));
      
      // Clear answers for this quiz
      setQuizAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[quizSessionId];
        return newAnswers;
      });
    } catch (error) {
      console.error('[Quiz Submit] Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    if (!activeQuiz) return;
    try {
      const response = await fetch(`http://localhost:3001/api/quizzes/${activeQuiz.quizSessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      const results = await response.json();
      console.log('Quiz results:', results);
      setQuizResults(results.data);
      setActiveQuiz(null);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
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
    <div className="h-full flex bg-black text-white">
      {/* Sidebar - Mobile overlay or desktop fixed */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? 'w-80' : 'w-0'}
        fixed md:relative z-30 h-full
        transition-all duration-300 
        ${isSidebarOpen ? 'border-r border-white/10' : 'border-0'}
        bg-black
        flex flex-col
        overflow-hidden
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

        {/* Syllabus Button */
        <div className="p-3 border-b border-white/10">
          <button
            onClick={() => router.push('/syllabus')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-black hover:bg-white/5 border border-white/20 rounded-lg transition-all text-sm font-medium"
          >
            <BookOpen size={16} className="text-white" />
            <span>Syllabus</span>
          </button>
        </div>

        }{/* Conversation List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          
          {/* Conversations Container - Styled like Syllabus */}
          <div className="p-3">
            <div className="bg-black border border-white/20 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => setIsConversationsExpanded(!isConversationsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-white" />
                  <span className="text-sm font-medium">Conversations</span>
                  <span className="text-xs text-white/40">({filteredConversations.length})</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-white transition-transform duration-200 ${
                    isConversationsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Collapsible Content */}
              <div className={`${
                isConversationsExpanded ? 'max-h-[calc(100vh-300px)]' : 'max-h-0'
              } overflow-y-auto scrollbar-hide transition-all duration-200`}>
                {/* Search Inside Conversations */}
                {isConversationsExpanded && (
                  <div className="p-3 border-t border-white/10">
                    <div className="relative group">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={14} />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black border border-white/20 hover:border-white/30 focus:border-white/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Conversations Timeline */}
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-white/40 text-sm">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  <div className="relative pb-7">
                    {/* Inactive Vertical Line - full height */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-white/20"></div>
                    
                    {filteredConversations.map((conv, index) => {
                      const isSelected = conversationId === conv.id;
                      const selectedIndex = filteredConversations.findIndex(c => c.id === conversationId);
                      const isBeforeSelected = selectedIndex >= 0 && index < selectedIndex;
                      
                      return (
                        <div
                          key={conv.id}
                          className={`relative pl-10 pr-3 py-3 hover:bg-white/5 transition-colors group cursor-pointer`}
                          onClick={() => router.push(`/chat/${conv.id}`)}
                        >
                          {/* Active vertical segment - yellow line for items BEFORE selected */}
                          {isBeforeSelected && (
                            <div className="absolute left-5 top-0 w-px h-full bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                          )}
                          
                          {/* Selected item - curved connection from vertical to horizontal */}
                          {isSelected && (
                            <>
                              {/* Vertical segment coming from above */}
                              <div className="absolute left-5 top-0 w-px h-6 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                              
                              {/* Curved corner - creates rounded L shape */}
                              <svg 
                                className="absolute left-5 top-6" 
                                width="20" 
                                height="12" 
                                viewBox="0 0 20 12"
                                style={{ transform: 'translate(-0.5px, -6px)' }}
                              >
                                <path
                                  d="M 0.5 0 Q 0.5 6, 6 6 L 20 6"
                                  fill="none"
                                  stroke="url(#yellowGradient)"
                                  strokeWidth="1.5"
                                />
                                <defs>
                                  <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#fbbf24" />
                                    <stop offset="100%" stopColor="#facc15" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </>
                          )}
                          
                          {/* Node on the line */}
                          <div className={`absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 transition-all z-10 ${
                            isSelected 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500 shadow-lg shadow-yellow-500/60' 
                              : 'bg-black border-white/40 group-hover:border-white group-hover:bg-white/20'
                          }`}></div>
                          
                          {/* Horizontal line to content - only gray for non-selected */}
                          {!isSelected && (
                            <div className="absolute left-6 top-6 w-4 h-px bg-white/20"></div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm truncate transition-colors ${
                                isSelected ? 'text-white' : 'text-white/80'
                              }`}>
                                {conv.title || conv.topic || 'New conversation'}
                              </div>
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-200 rounded">
                                {new Date(conv.lastActiveAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="p-1.5 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="border-t border-white/10">
          <div className="p-3">
            <div className="bg-black border border-white/20 rounded-lg overflow-hidden">
              {/* Help Header */}
              <button
                onClick={() => setIsHelpExpanded(!isHelpExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-white" />
                  <span className="text-sm font-medium">Help & Support</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-white transition-transform duration-200 ${
                    isHelpExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Help Options */}
              <div className={`${
                isHelpExpanded ? 'max-h-40' : 'max-h-0'
              } overflow-hidden transition-all duration-200`}>
                <div className="border-t border-white/10">
                  <button
                    onClick={() => router.push('/privacy-policy')}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span>Privacy Policy</span>
                  </button>
                  <button
                    onClick={() => router.push('/terms')}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5"
                  >
                    <span>Terms of Service</span>
                  </button>
                  <button
                    onClick={() => router.push('/help')}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5"
                  >
                    <span>Help Center</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="border-t border-white/10 relative">
          {user && (
            <div className="p-2">
              {/* Profile Card */}
              <div className="bg-black border border-white/20 rounded-lg p-2">
                <div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
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
                    <div className="flex items-center gap-1.5">
                      <div className="text-xs font-medium text-white truncate leading-none">{user.user.displayName}</div>
                      {/* Role Badge */}
                      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 p-[1px] rounded flex-shrink-0">
                        <div className="bg-black px-1.5 py-[3px] rounded flex items-center justify-center">
                          <span className="text-[9px] text-white font-bold leading-none">{user.user.role.charAt(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* Header */}
        <div className="flex-shrink-0 h-12 border-b border-white/10 flex items-center px-3 gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1"></div>
          
          {/* Total Token Count */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-medium">
              <Coins className="w-3.5 h-3.5" />
              <span>{totalTokens.toLocaleString()}</span>
            </div>
          )}
          
          {/* Model Selector */}
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
                    
                    <div className={`flex-1 ${msg.role === 'user' ? 'max-w-[70%] md:max-w-xl' : ''}`}>
                      {/* Sender name in gray */}
                      {msg.role === 'assistant' && (
                        <div className="text-xs text-gray-500 mb-1 ml-1">Kai</div>
                      )}
                      {msg.role === 'user' && (
                        <div className="text-xs text-gray-500 mb-1 mr-1 text-right">You</div>
                      )}
                      
                      <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                        msg.role === 'user'
                          ? 'bg-black border border-white text-white ml-auto'
                          : 'bg-transparent text-white'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <>
                            {/* Thinking Block (if present) */}
                            {msg.thinking && (
                              <ThinkingBlock thinking={msg.thinking} />
                            )}
                            
                            {/* Main Content */}
                            {msg.messageType !== 'quiz' && (
                              <div className="text-sm md:text-base markdown-content max-w-full overflow-hidden">
                                <MarkdownRenderer content={msg.content} />
                              </div>
                            )}
                            
                            {/* Quiz Message - Display quiz inline */}
                            {msg.messageType === 'quiz' && msg.quizSessionId && (() => {
                              console.log('[Quiz Render] Checking quiz message:', msg.id, 'quizSessionId:', msg.quizSessionId);
                              console.log('[Quiz Render] Loaded quizzes:', Object.keys(loadedQuizzes));
                              console.log('[Quiz Render] Has quiz data:', !!loadedQuizzes[msg.quizSessionId]);
                              
                              if (!loadedQuizzes[msg.quizSessionId]) {
                                return (
                                  <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                    <p className="text-white/60 text-sm">Loading quiz...</p>
                                  </div>
                                );
                              }
                              
                              const quiz = loadedQuizzes[msg.quizSessionId];
                              console.log('[Quiz Render] Rendering quiz with', quiz.questions?.length, 'questions');
                              const isCompleted = quiz.completedAt != null;
                              const userAnswers = quizAnswers[msg.quizSessionId] || {};
                              
                              return (
                                <div className="mt-6 space-y-0">
                                  {quiz.questions?.map((q: any, idx: number) => {
                                    const userAnswer = isCompleted 
                                      ? quiz.answers?.find((a: any) => a.questionId === q.id)
                                      : null;
                                    const isCorrect = userAnswer?.isCorrect;
                                    
                                    return (
                                      <div 
                                        key={q.id}
                                        className="py-6 border-b border-white/5 last:border-b-0"
                                      >
                                        {/* Question Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                              <span className="text-white font-bold text-sm">{idx + 1}</span>
                                            </div>
                                          </div>
                                          <div className="flex-1 pt-0.5">
                                            <div className="flex items-center gap-3 mb-3">
                                              <span className={`text-[10px] uppercase tracking-wider font-bold ${
                                                q.difficulty === 'easy' ? 'text-green-400' :
                                                q.difficulty === 'hard' ? 'text-red-400' :
                                                'text-yellow-400'
                                              }`}>
                                                {q.difficulty}
                                              </span>
                                              <div className="h-1 w-1 rounded-full bg-white/20"></div>
                                              <span className="text-xs text-white/30 font-medium">{q.points} points</span>
                                            </div>
                                            <p className="text-base text-white/90 leading-relaxed font-light">{q.questionText}</p>
                                          </div>
                                        </div>

                                        {/* Answer Options/Input */}
                                        <div className="space-y-2.5 ml-12">
                                          {(q.questionType === 'mcq' || q.questionType === 'true-false') && q.options ? (
                                            q.options.map((option: string, optIdx: number) => {
                                              const isSelected = userAnswers[q.id] === option;
                                              const isUserAnswer = isCompleted && userAnswer?.userAnswer === option;
                                              const isCorrectAnswer = isCompleted && q.correctAnswer === option;
                                              
                                              return (
                                                <button
                                                  key={optIdx}
                                                  onClick={() => !isCompleted && handleQuizAnswerChange(msg.quizSessionId!, q.id, option)}
                                                  disabled={isCompleted}
                                                  className={`group w-full text-left px-4 py-3 rounded-xl text-sm transition-all relative ${
                                                    isCompleted
                                                      ? isCorrectAnswer
                                                        ? 'bg-white/[0.02] text-white border-l-2 border-green-400'
                                                        : isUserAnswer
                                                          ? 'bg-white/[0.02] text-white/60 border-l-2 border-red-400'
                                                          : 'bg-transparent text-white/30 border-l-2 border-transparent'
                                                      : isSelected
                                                        ? 'bg-white/5 text-white border-l-2 border-white/40'
                                                        : 'bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:text-white border-l-2 border-transparent hover:border-white/20'
                                                  }`}
                                                >
                                                  <span className="flex items-center gap-3">
                                                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                                                      isCompleted
                                                        ? isCorrectAnswer
                                                          ? 'border-green-400 bg-green-400'
                                                          : isUserAnswer
                                                            ? 'border-red-400 bg-red-400'
                                                            : 'border-white/10 bg-transparent'
                                                        : isSelected
                                                          ? 'border-white/60 bg-white/20'
                                                          : 'border-white/20 bg-transparent group-hover:border-white/40'
                                                    }`}>
                                                      {(isCompleted && (isCorrectAnswer || isUserAnswer)) && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                          {isCorrectAnswer ? (
                                                            <svg className="w-3 h-3 text-black" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                          ) : (
                                                            <svg className="w-3 h-3 text-black" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                          )}
                                                        </div>
                                                      )}
                                                    </span>
                                                    {option}
                                                  </span>
                                                </button>
                                              );
                                            })
                                          ) : (
                                            <div>
                                              {isCompleted ? (
                                                <div className="space-y-3">
                                                  <div className="px-4 py-3 rounded-xl bg-white/[0.02] border-l-2 ${
                                                    isCorrect ? 'border-green-400' : 'border-red-400'
                                                  }">
                                                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Your Answer</p>
                                                    <p className={`text-sm ${
                                                      isCorrect ? 'text-white' : 'text-white/60'
                                                    }`}>
                                                      {userAnswer?.userAnswer || 'No answer'}
                                                    </p>
                                                  </div>
                                                  {!isCorrect && (
                                                    <div className="px-4 py-3 rounded-xl bg-white/[0.02] border-l-2 border-green-400">
                                                      <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Correct Answer</p>
                                                      <p className="text-sm text-white">{q.correctAnswer}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <textarea
                                                  value={userAnswers[q.id] || ''}
                                                  onChange={(e) => handleQuizAnswerChange(msg.quizSessionId!, q.id, e.target.value)}
                                                  placeholder="Type your answer..."
                                                  className="w-full px-4 py-3 bg-white/[0.02] border-l-2 border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 resize-none transition-all"
                                                  rows={3}
                                                />
                                              )}
                                            </div>
                                          )}
                                          
                                          {/* Explanation (shown after completion) */}
                                          {isCompleted && q.explanation && (
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                              <div className="flex items-start gap-3">
                                                <HelpCircle className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />
                                                <div>
                                                  <p className="text-[10px] uppercase tracking-wider font-bold text-white/40 mb-2">Explanation</p>
                                                  <p className="text-sm text-white/60 leading-relaxed">{q.explanation}</p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Submit Button or Results Summary */}
                                  {!isCompleted ? (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                      <button
                                        onClick={() => handleInlineQuizSubmit(msg.quizSessionId!)}
                                        className="group relative w-full px-6 py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl text-white font-light transition-all flex items-center justify-center gap-3 text-sm overflow-hidden"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <Send className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                                        <span className="relative z-10 uppercase tracking-wider text-xs">Submit Quiz</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                      {/* Score Display */}
                                      <div className="text-center mb-6">
                                        <div className="inline-block">
                                          <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extralight text-white">{quiz.score}</span>
                                            <span className="text-2xl font-light text-white/40">%</span>
                                          </div>
                                          <div className="mt-1 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                                        </div>
                                        <p className="text-xs text-white/30 mt-3 uppercase tracking-widest">Final Score</p>
                                      </div>

                                      {/* Stats - Minimalist */}
                                      <div className="flex items-center justify-center gap-8">
                                        <div className="text-center">
                                          <div className="text-2xl font-light text-green-400">{quiz.answers?.filter((a: any) => a.isCorrect).length}</div>
                                          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Correct</div>
                                        </div>
                                        <div className="h-8 w-px bg-white/10"></div>
                                        <div className="text-center">
                                          <div className="text-2xl font-light text-red-400">{quiz.answers?.filter((a: any) => !a.isCorrect).length}</div>
                                          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Wrong</div>
                                        </div>
                                        <div className="h-8 w-px bg-white/10"></div>
                                        <div className="text-center">
                                          <div className="text-2xl font-light text-white">{quiz.answers?.filter((a: any) => a.isCorrect).reduce((sum: number, a: any) => {
                                            const q = quiz.questions?.find((q: any) => q.id === a.questionId);
                                            return sum + (q?.points || 0);
                                          }, 0)}</div>
                                          <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">Points</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="whitespace-pre-wrap break-words text-sm md:text-base">
                            {msg.content}
                          </div>
                        )}
                      </div>
                      
                      {/* Metadata section with tokens, tags, and vector embeddings - all on same line */}
                      {msg.role === 'assistant' && (
                        <div className="mt-3 ml-2 md:ml-4">
                          <div className="flex items-center gap-3 text-xs flex-wrap">
                            {/* Always show tokens section, display count or placeholder */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
                              <Coins className="w-3.5 h-3.5" />
                              <span className="font-medium">{msg.tokensUsed || 0} tokens</span>
                            </div>
                            
                            {/* Thought Tags - always show if available */}
                            {msg.thoughtTags && msg.thoughtTags.trim() && (
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/20 text-white/50 text-[11px] font-medium">context:</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {msg.thoughtTags.split(',').filter(t => t.trim()).map((tag, tagIdx) => {
                                    // Color mapping for tags
                                    const colors = [
                                      'bg-blue-500/20 border-blue-500/50 text-blue-200',
                                      'bg-purple-500/20 border-purple-500/50 text-purple-200',
                                      'bg-green-500/20 border-green-500/50 text-green-200',
                                      'bg-orange-500/20 border-orange-500/50 text-orange-200',
                                      'bg-pink-500/20 border-pink-500/50 text-pink-200',
                                      'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
                                    ];
                                    const colorClass = colors[tagIdx % colors.length];
                                    
                                    return (
                                      <span
                                        key={tagIdx}
                                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${colorClass}`}
                                        title="AI thought context"
                                      >
                                        {tag.trim()}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Copy button */}
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(msg.content);
                                  setCopiedMessageId(msg.id);
                                  setTimeout(() => setCopiedMessageId(null), 2000);
                                } catch (err) {
                                  console.error('Failed to copy:', err);
                                }
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 transition-colors"
                              title="Copy message"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="font-medium">{copiedMessageId === msg.id ? 'copied' : 'copy'}</span>
                            </button>
                            
                            {/* Vector visualization button */}
                            {msg.embedding && (
                              <button
                                onClick={() => {
                                  setExpandedEmbedding(expandedEmbedding === msg.id ? null : msg.id);
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
                              >
                                <Database className="w-3.5 h-3.5" />
                                <span className="font-medium">{expandedEmbedding === msg.id ? 'hide' : 'show'} vector</span>
                              </button>
                            )}
                            
                            {/* Debug info - remove this after testing */}

                          </div>
                        </div>
                      )}
                      
                      {/* Inline Vector Visualization */}
                      {msg.role === 'assistant' && expandedEmbedding === msg.id && msg.embedding && (
                        <div className="mt-2 ml-2 md:ml-4">
                          {(() => {
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
                      )}
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
                    <div className="bg-black rounded-2xl px-3 py-2 md:px-4 md:py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-pink-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Configuration Form - Inline Message Style */}
              {showQuizConfigForm && (
                <div className="mb-4 md:mb-8 flex gap-2 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 ml-1">Kai</div>
                    <div className="bg-transparent text-white rounded-2xl">
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-white">Configure Your Quiz</h3>
                            <p className="text-xs text-white/60 mt-0.5">Customize the quiz settings below</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Question Types */}
                          <div>
                            <label className="text-xs text-white/70 mb-2 block font-medium">Question Types</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { value: 'mcq', label: 'Multiple Choice' },
                                { value: 'true-false', label: 'True/False' },
                                { value: 'short-answer', label: 'Short Answer' }
                              ].map(type => (
                                <button
                                  key={type.value}
                                  onClick={() => {
                                    setQuizConfig(prev => {
                                      const types = prev.questionTypes.includes(type.value)
                                        ? prev.questionTypes.filter(t => t !== type.value)
                                        : [...prev.questionTypes, type.value];
                                      return { ...prev, questionTypes: types.length > 0 ? types : [type.value] };
                                    });
                                  }}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    quizConfig.questionTypes.includes(type.value)
                                      ? 'bg-blue-500 text-white border-2 border-blue-400'
                                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Number of Questions */}
                          <div>
                            <label className="text-xs text-white/70 mb-2 block font-medium">Number of Questions</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[5, 10, 15].map(count => (
                                <button
                                  key={count}
                                  onClick={() => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    quizConfig.questionCount === count
                                      ? 'bg-purple-500 text-white border-2 border-purple-400'
                                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {count}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div>
                            <label className="text-xs text-white/70 mb-2 block font-medium">Difficulty Level</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { value: 'easy', label: 'Easy', color: 'bg-green-500', border: 'border-green-400' },
                                { value: 'medium', label: 'Medium', color: 'bg-yellow-500', border: 'border-yellow-400' },
                                { value: 'hard', label: 'Hard', color: 'bg-red-500', border: 'border-red-400' }
                              ].map(diff => (
                                <button
                                  key={diff.value}
                                  onClick={() => setQuizConfig(prev => ({ ...prev, difficulty: diff.value }))}
                                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    quizConfig.difficulty === diff.value
                                      ? `${diff.color} text-white border-2 ${diff.border}`
                                      : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {diff.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Generate Button */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setShowQuizConfigForm(false);
                                setQuizPrompt('');
                                setMessages(prev => prev.slice(0, -1)); // Remove user message
                                setQuizConfig({ questionCount: 5, questionTypes: ['mcq', 'true-false'], difficulty: 'medium', description: '' });
                              }}
                              className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (quizConfig.questionTypes.length === 0) {
                                  alert('Please select at least one question type');
                                  return;
                                }
                                
                                setShowQuizConfigForm(false);
                                setIsGeneratingQuiz(true);
                                
                                try {
                                  const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/generate-quiz`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      questionCount: quizConfig.questionCount,
                                      questionTypes: quizConfig.questionTypes,
                                      difficulty: quizConfig.difficulty,
                                      description: quizPrompt
                                    }),
                                  });
                                  if (!response.ok) throw new Error('Failed to generate quiz');
                                  const quiz = await response.json();
                                  
                                  setLoadedQuizzes(prev => ({
                                    ...prev,
                                    [quiz.data.quizSessionId]: quiz.data
                                  }));
                                  setEnableQuiz(false);
                                  setQuizPrompt('');
                                  setQuizConfig({ questionCount: 5, questionTypes: ['mcq', 'true-false'], difficulty: 'medium', description: '' });
                                  
                                  // Reload messages to show quiz
                                  setTimeout(() => {
                                    if (conversationId && conversationId !== 'new') {
                                      loadMessages(conversationId);
                                    }
                                    setIsGeneratingQuiz(false);
                                  }, 500);
                                } catch (error) {
                                  console.error('Failed to generate quiz:', error);
                                  alert('Failed to generate quiz. Please try again.');
                                  setIsGeneratingQuiz(false);
                                }
                              }}
                              disabled={isGeneratingQuiz}
                              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isGeneratingQuiz ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-4 h-4" />
                                  Generate
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGeneratingQuiz && (
                <div className="mb-4 md:mb-8 flex gap-2 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 ml-1">Kai</div>
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl px-3 py-3 md:px-4 md:py-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-white">Generating Quiz...</p>
                          <p className="text-xs text-white/60 mt-0.5">Creating {quizConfig.questionCount} {quizConfig.difficulty} questions</p>
                        </div>
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
          <div className="w-full max-w-4xl mx-auto px-2 md:px-4">
            {/* Tools Dropdown */}
            {showTools && (
              <div className="mb-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                  <Wrench size={14} />
                  <span className="font-medium">Select Tools</span>
                </div>
                
                {/* Web Search Option */}
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    webSearchEnabled
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    <Globe size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Web Search</div>
                    <div className="text-xs text-white/60">Search the internet for information</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={webSearchEnabled}
                    onChange={(e) => setWebSearchEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
              </div>
            )}

            {/* Unified Input Container - Single rounded rectangle */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-white/30 transition-colors">
              {/* Tools Button - Inside Left */}
              <button
                onClick={() => setShowTools(!showTools)}
                className={`ml-3 flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors ${
                  showTools || webSearchEnabled || enableQuiz
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Tools"
              >
                <Wrench size={14} />
              </button>
              
              {/* Input Field - Seamless integration */}
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
                className="flex-1 bg-transparent border-0 px-3 py-2.5 text-sm resize-none focus:outline-none scrollbar-hide text-white placeholder-white/40"
                style={{ minHeight: '38px', maxHeight: '120px', overflow: 'hidden' }}
              />
              
              {/* Active Tool Indicators */}
              {(webSearchEnabled || enableQuiz) && (
                <div className="mr-2 flex items-center gap-1.5 flex-shrink-0">
                  {webSearchEnabled && (
                    <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center gap-1">
                      <Globe size={10} className="text-blue-400" />
                      <span className="text-xs text-blue-300">Web</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Quiz Button - Right Side */}
              {conversationId && conversationId !== 'new' && (
                <button
                  onClick={() => setEnableQuiz(!enableQuiz)}
                  className={`mr-2 flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all ${
                    enableQuiz
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title="Generate Quiz"
                >
                  <Brain size={14} />
                </button>
              )}
              
              {/* Model Selector - Inside Right (before send button) */}
              <div className="mr-2 flex-shrink-0">
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                />
              </div>
              
              {/* Send Button - Inside Right */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="mr-3 flex-shrink-0 w-[30px] h-[30px] bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Configuration Form - Inline in messages */}
      {showQuizConfigForm && (
        <div className="hidden"></div>
      )}
      {/* Actual form is now rendered inline in messages - see below */}
      
      {/* Old modal form - keeping structure for reference but hidden */}
      {false && showQuizConfigForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Configure Quiz</h2>
                <p className="text-sm text-white/60 mt-0.5">Customize your quiz settings</p>
              </div>
              <button
                onClick={() => {
                  setShowQuizConfigForm(false);
                  setQuizPrompt('');
                  setQuizConfig({ questionCount: 5, questionTypes: ['mcq', 'true-false'], difficulty: 'medium', description: '' });
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User's Prompt Display */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <label className="text-xs text-white/70 font-medium">Your Prompt</label>
                </div>
                <p className="text-sm text-white">{quizPrompt}</p>
              </div>

              {/* Question Types */}
              <div>
                <label className="text-sm text-white/70 mb-2 block font-medium">Question Types</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'mcq', label: 'Multiple Choice', icon: 'list' },
                    { value: 'true-false', label: 'True/False', icon: 'check-circle' },
                    { value: 'short-answer', label: 'Short Answer', icon: 'edit' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setQuizConfig(prev => {
                          const types = prev.questionTypes.includes(type.value)
                            ? prev.questionTypes.filter(t => t !== type.value)
                            : [...prev.questionTypes, type.value];
                          return { ...prev, questionTypes: types.length > 0 ? types : [type.value] };
                        });
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        quizConfig.questionTypes.includes(type.value)
                          ? 'bg-blue-500 text-white border-2 border-blue-400'
                          : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="text-sm text-white/70 mb-2 block font-medium">Number of Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        quizConfig.questionCount === count
                          ? 'bg-purple-500 text-white border-2 border-purple-400'
                          : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm text-white/70 mb-2 block font-medium">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'easy', label: 'Easy', color: 'bg-green-500', border: 'border-green-400' },
                    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', border: 'border-yellow-400' },
                    { value: 'hard', label: 'Hard', color: 'bg-red-500', border: 'border-red-400' }
                  ].map(diff => (
                    <button
                      key={diff.value}
                      onClick={() => setQuizConfig(prev => ({ ...prev, difficulty: diff.value }))}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        quizConfig.difficulty === diff.value
                          ? `${diff.color} text-white border-2 ${diff.border}`
                          : 'bg-white/5 text-white/60 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowQuizConfigForm(false);
                    setQuizPrompt('');
                    setQuizConfig({ questionCount: 5, questionTypes: ['mcq', 'true-false'], difficulty: 'medium', description: '' });
                  }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (quizConfig.questionTypes.length === 0) {
                      alert('Please select at least one question type');
                      return;
                    }
                    
                    setShowQuizConfigForm(false);
                    setIsGeneratingQuiz(true);
                    
                    try {
                      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/generate-quiz`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          questionCount: quizConfig.questionCount,
                          questionTypes: quizConfig.questionTypes,
                          difficulty: quizConfig.difficulty,
                          description: quizPrompt
                        }),
                      });
                      if (!response.ok) throw new Error('Failed to generate quiz');
                      const quiz = await response.json();
                      
                      setLoadedQuizzes(prev => ({
                        ...prev,
                        [quiz.data.quizSessionId]: quiz.data
                      }));
                      setEnableQuiz(false);
                      setQuizPrompt('');
                      setQuizConfig({ questionCount: 5, questionTypes: ['mcq', 'true-false'], difficulty: 'medium', description: '' });
                      
                      // Reload messages to show quiz
                      setTimeout(() => {
                        if (conversationId && conversationId !== 'new') {
                          loadMessages(conversationId);
                        }
                        setIsGeneratingQuiz(false);
                      }, 500);
                    } catch (error) {
                      console.error('Failed to generate quiz:', error);
                      alert('Failed to generate quiz. Please try again.');
                      setIsGeneratingQuiz(false);
                    }
                  }}
                  disabled={isGeneratingQuiz}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Components - Only keep results modal */}
      {activeQuiz && (() => {
        console.log('[Quiz] Rendering QuizView modal with activeQuiz:', activeQuiz);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <QuizView
                quizSessionId={activeQuiz.quizSessionId}
                topic={activeQuiz.topic}
                questions={activeQuiz.questions}
                onSubmit={handleQuizSubmit}
                onClose={() => setActiveQuiz(null)}
              />
            </div>
          </div>
        );
      })()}

      {quizResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <QuizResults
              topic={quizResults.topic}
              score={quizResults.score}
              totalPoints={quizResults.totalPoints}
              questions={quizResults.questions}
              answers={quizResults.answers}
              completedAt={quizResults.completedAt}
              onRetake={() => {
                setQuizResults(null);
                setEnableQuiz(true);
              }}
              onClose={() => setQuizResults(null)}
            />
          </div>
        </div>
      )}

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


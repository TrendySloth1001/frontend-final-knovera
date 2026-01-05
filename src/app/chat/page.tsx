/**
 * AI Chat Page
 * Full-featured chatbot interface inspired by ChatGPT/Claude
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { aiAPI, type Conversation, type Message } from '@/lib/ai-api';
import { Send, Plus, Trash2, Search, Menu, X, MessageSquare, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load conversations
  useEffect(() => {
    if (user?.user?.id) {
      loadConversations();
    }
  }, [user]);

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
    inputRef.current?.focus();
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
      const response = await aiAPI.generate({
        prompt: userMessage,
        conversationId: currentConversation?.id,
        userId: user.user.id,
        teacherId: user.user.role === 'TEACHER' ? user.user.id : undefined,
        studentId: user.user.role === 'STUDENT' ? user.user.id : undefined,
        useRAG: true,
        sessionType: 'chat',
      });

      // If new conversation, reload conversation list
      if (!currentConversation) {
        await loadConversations();
        const newConv = await aiAPI.getConversation(response.conversationId);
        setCurrentConversation(newConv);
      }

      // Add assistant response
      const assistantMsg: Message = {
        id: response.messageId,
        conversationId: response.conversationId,
        role: 'assistant',
        content: response.response,
        tokensUsed: response.tokensUsed,
        sequenceNumber: messages.length + 1,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev.slice(0, -1), tempUserMsg, assistantMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temporary message on error
      setMessages(prev => prev.slice(0, -1));
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      await aiAPI.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConversation?.id === convId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
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
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-white/10 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>
          <button
            onClick={startNewChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="New chat"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConversation(conv)}
                className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 flex items-start gap-3 ${
                  currentConversation?.id === conv.id ? 'bg-white/10' : ''
                }`}
              >
                <MessageSquare size={18} className="text-white/60 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {conv.title || conv.topic || 'New conversation'}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {new Date(conv.lastActiveAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-white/60" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center px-6 gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">
              {currentConversation?.title || currentConversation?.topic || 'New Chat'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-white/40" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-white/60 max-w-md">
                Ask me anything! I can help you with your studies, answer questions, or just chat.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`mb-8 flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">AI</span>
                    </div>
                  )}
                  
                  <div className={`flex-1 ${msg.role === 'user' ? 'max-w-2xl' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-white text-black ml-auto'
                        : 'bg-white/5'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </div>
                    </div>
                    {msg.tokensUsed && (
                      <div className="text-xs text-white/40 mt-1 ml-4">
                        {msg.tokensUsed} tokens
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && user?.user?.avatarUrl && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img src={user.user.avatarUrl} alt="You" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-8 flex gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
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
        <div className="border-t border-white/10 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:border-white/30 transition-colors"
                  style={{ minHeight: '52px', maxHeight: '200px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

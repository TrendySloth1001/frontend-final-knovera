import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Send, 
  Paperclip, 
  User, 
  Users, 
  Circle, 
  ArrowLeft,
  Settings,
  Hash,
  Pin,
  Check,
  CheckCheck,
  Menu,
  X
} from 'lucide-react';

/**
 * OLED BLACK CHAT UI
 * * Features:
 * - Absolute #000000 background
 * - Pure White / Gray Scale typography
 * - Thin 1px borders for separation
 * - Integrated logic for the requested Express routes
 */

const App = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 'u-1',
    username: 'alex_nord',
    name: 'Alex Nord'
  });
  
  const [conversations, setConversations] = useState([
    {
      id: 'c-1',
      name: 'Design Sync',
      isGroup: true,
      lastMessage: 'The black UI looks stunning.',
      time: '12:45 PM',
      unreadCount: 3,
      pinned: true,
      members: ['u-1', 'u-2', 'u-3']
    },
    {
      id: 'c-2',
      name: 'Sarah Connor',
      isGroup: false,
      lastMessage: 'Let me know when you arrive.',
      time: 'Yesterday',
      unreadCount: 0,
      pinned: false,
      online: true,
      members: ['u-1', 'u-2']
    },
    {
      id: 'c-3',
      name: 'John Doe',
      isGroup: false,
      lastMessage: 'Got the files!',
      time: 'Monday',
      unreadCount: 0,
      pinned: false,
      online: false,
      members: ['u-1', 'u-4']
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { id: 1, senderId: 'u-2', text: 'Hey, how is the progress on the new Dark Mode?', time: '12:40 PM', seen: true },
    { id: 2, senderId: 'u-1', text: 'It is actually an Absolute Black mode. Perfect for OLED screens.', time: '12:42 PM', seen: true },
    { id: 3, senderId: 'u-2', text: 'The black UI looks stunning.', time: '12:45 PM', seen: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      
      {/* LEFT SIDEBAR - List of Conversations */}
      <aside className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 ease-in-out border-r border-white/10 flex flex-col h-full bg-black
        md:relative absolute z-20 h-full
      `}>
        {/* User Profile Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <User size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{currentUser.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-zinc-900 transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Pinned</div>
            {conversations.filter(c => c.pinned).map(conv => (
              <ConversationItem 
                key={conv.id} 
                conv={conv} 
                active={activeConversation?.id === conv.id}
                onClick={() => {
                  setActiveConversation(conv);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            ))}

            <div className="px-3 py-2 mt-4 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Recent Messages</div>
            {conversations.filter(c => !c.pinned).map(conv => (
              <ConversationItem 
                key={conv.id} 
                conv={conv} 
                active={activeConversation?.id === conv.id}
                onClick={() => {
                  setActiveConversation(conv);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-black relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 -ml-2 hover:bg-white/10 rounded-full text-zinc-400"
                >
                  <Menu size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                    {activeConversation.isGroup ? <Users size={20} /> : <User size={20} />}
                  </div>
                  {activeConversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">{activeConversation.name}</h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                    {activeConversation.isGroup ? `${activeConversation.members.length} members` : activeConversation.online ? 'Active Now' : 'Last seen 2h ago'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400"><Search size={18} /></button>
                <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400"><MoreVertical size={18} /></button>
              </div>
            </header>

            {/* Messages Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              <div className="flex justify-center my-4">
                <span className="text-[10px] px-3 py-1 bg-zinc-900 rounded-full text-zinc-500 uppercase tracking-widest">Today</span>
              </div>
              
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group`}>
                      {!isMe && activeConversation.isGroup && (
                        <span className="text-[10px] text-zinc-500 ml-3 mb-1 block">~user_{msg.senderId}</span>
                      )}
                      <div className={`
                        px-4 py-3 rounded-2xl text-sm leading-relaxed
                        ${isMe 
                          ? 'bg-white text-black rounded-tr-none' 
                          : 'bg-zinc-900 text-white border border-white/5 rounded-tl-none'}
                      `}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">{msg.time}</span>
                        {isMe && (
                          msg.seen 
                            ? <CheckCheck size={12} className="text-blue-500" /> 
                            : <Check size={12} className="text-zinc-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <footer className="p-4 border-t border-white/10 bg-black">
              <form 
                onSubmit={handleSendMessage}
                className="max-w-4xl mx-auto flex items-end gap-2 bg-zinc-900/40 p-2 rounded-2xl border border-white/5 focus-within:border-white/20 transition-all"
              >
                <button type="button" className="p-3 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 resize-none max-h-32 placeholder:text-zinc-600"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all ${
                    newMessage.trim() 
                      ? 'bg-white text-black hover:scale-105 active:scale-95' 
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-center text-[9px] text-zinc-700 mt-2 uppercase tracking-[0.2em]">End-to-End Encrypted Communication</p>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
              <Hash size={40} className="text-zinc-700" />
            </div>
            <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
            <p className="text-zinc-500 text-sm max-w-xs">Connect with your friends or start a group chat. All messages are encrypted.</p>
          </div>
        )}
      </main>

      {/* STYLES */}
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
        input::placeholder, textarea::placeholder {
          font-weight: 500;
        }
      `}} />
    </div>
  );
};

interface ConversationItemProps {
  conv: any;
  active: boolean;
  onClick: () => void;
}

const ConversationItem = ({ conv, active, onClick }: ConversationItemProps) => {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative
        ${active ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'}
      `}
    >
      <div className="relative">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center border
          ${active ? 'bg-black/10 border-black/5' : 'bg-zinc-900 border-white/5'}
        `}>
          {conv.isGroup ? <Users size={22} /> : <User size={22} />}
        </div>
        {!conv.isGroup && conv.online && (
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 bg-emerald-500 ${active ? 'border-white' : 'border-black'}`} />
        )}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`text-sm font-bold truncate ${active ? 'text-black' : 'text-zinc-100'}`}>
            {conv.name}
          </span>
          <span className={`text-[10px] font-medium ${active ? 'text-black/60' : 'text-zinc-500'}`}>
            {conv.time}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate font-medium ${active ? 'text-black/80' : 'text-zinc-500'}`}>
            {conv.lastMessage}
          </p>
          {conv.unreadCount > 0 && !active && (
            <span className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[1.2rem] text-center ml-2">
              {conv.unreadCount}
            </span>
          )}
          {conv.pinned && !active && (
            <Pin size={12} className="text-zinc-700 ml-2" />
          )}
        </div>
      </div>
    </button>
  );
};

export default App;
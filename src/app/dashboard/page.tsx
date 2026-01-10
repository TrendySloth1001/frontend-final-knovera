'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowUpRight,
  MessageSquare,
  Brain,
  BookOpen,
  Zap,
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Mail,
  Calendar,
  GraduationCap,
  Building,
  Award
} from 'lucide-react';
import { aiAPI } from '@/lib/ai-api';
import { apiClient } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalQuizzes: 0,
    totalStudyPlans: 0,
    tokensUsed: 0,
    averageScore: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadCountRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState('account'); // account | ai | profile
  const [aiSettings, setAiSettings] = useState({
    baseTone: 'friendly',
    warmth: 7,
    enthusiasm: 7,
    emojiUsage: 'occasional',
    useHeaders: true,
    responseLength: 'balanced',
    customInstructions: null as string | null,
    profileEnabled: false,
  });
  const [userContext, setUserContext] = useState({
    learningGoals: null as string | null,
    weakSubjects: [] as string[],
    strongSubjects: [] as string[],
    preferredExamples: null as string | null,
    interests: null as string | null,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const illustrations = [
    '/illustrations/Analysis-bro.png',
    '/illustrations/Exams-cuate.png',
    '/illustrations/Knowledge-cuate.png',
    '/illustrations/Learning-bro.png',
    '/illustrations/Teaching-cuate.png'
  ];

  // Pick random illustration on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * illustrations.length);
    setCurrentIllustration(illustrations[randomIndex]);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadNotifications();
      loadAISettings();
    }
  }, [isAuthenticated]);

  // Poll notifications every 10 seconds
  useEffect(() => {
    if (!user?.user?.id) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user?.user?.id]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load conversations with user ID
      const userId = user?.user?.id;
      const conversations = await aiAPI.getConversations(userId);
      
      console.log('[Dashboard] Loaded conversations:', conversations.length);
      
      // Calculate tokens from conversations
      const totalTokens = conversations.reduce((sum: number, conv: any) => {
        return sum + (conv.messages?.reduce((msgSum: number, msg: any) => msgSum + (msg.tokensUsed || 0), 0) || 0);
      }, 0);

      // Count quizzes and study plans from conversation messages
      let quizCount = 0;
      let studyPlanCount = 0;
      let quizScores: number[] = [];

      conversations.forEach((conv: any) => {
        conv.messages?.forEach((msg: any) => {
          if (msg.messageType === 'quiz') {
            quizCount++;
            console.log('[Dashboard] Found quiz:', msg.quizSessionId);
          }
          if (msg.messageType === 'study-plan') {
            studyPlanCount++;
            console.log('[Dashboard] Found study plan');
          }
        });
      });

      console.log('[Dashboard] Stats:', {
        conversations: conversations.length,
        quizzes: quizCount,
        studyPlans: studyPlanCount,
        tokens: totalTokens
      });

      // TODO: Fetch actual quiz scores when available
      const avgScore = quizScores.length > 0 
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
        : 0;

      setStats({
        totalConversations: conversations.length,
        totalQuizzes: quizCount,
        totalStudyPlans: studyPlanCount,
        tokensUsed: totalTokens,
        averageScore: Math.round(avgScore),
      });

      // Set recent activity (last 10 conversations)
      setRecentActivity(conversations.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (!user?.user?.id) return;
      const response = await apiClient.get<any>(`/api/notifications?userId=${user.user.id}`);
      
      const newNotifications = response.data || [];
      const newUnreadCount = response.meta?.unreadCount || 0;
      
      // Update cached count
      previousUnreadCountRef.current = newUnreadCount;
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`, { userId: user?.user?.id });
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const loadAISettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?.user.id) return;

      const settingsRes = await fetch(`http://localhost:3001/api/users/${user.user.id}/ai-settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (settingsRes.ok) {
        const result = await settingsRes.json();
        if (result.success && result.data) {
          setAiSettings(result.data);
        }
      }

      const contextRes = await fetch(`http://localhost:3001/api/users/${user.user.id}/context`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (contextRes.ok) {
        const result = await contextRes.json();
        if (result.success && result.data) {
          setUserContext(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const saveAISettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`http://localhost:3001/api/users/${user?.user.id}/ai-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiSettings),
      });

      if (aiSettings.profileEnabled) {
        await fetch(`http://localhost:3001/api/users/${user?.user.id}/context`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userContext),
        });
      }

      showNotification('success', 'AI settings saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', 'Failed to save AI settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Sidebar item component
  const NavItem = ({ icon: Icon, label, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-4 py-3 cursor-pointer transition-colors duration-200 ${
        activeTab === label ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] text-neutral-100 font-sans selection:bg-neutral-800">
      
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-neutral-800 flex flex-col p-6 bg-[#000000] transform transition-transform duration-300 lg:transform-none ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
          <span className="font-bold tracking-tight text-lg">KNOVERA.</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" onClick={() => setActiveTab('Overview')} />
          <div className="relative">
            <NavItem icon={Bell} label="Notifications" onClick={() => setActiveTab('Notifications')} />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <NavItem icon={BarChart3} label="Analytics" onClick={() => setActiveTab('Analytics')} />
          <NavItem icon={Users} label="Community" onClick={() => setActiveTab('Community')} />
        </nav>

        <div className="pt-6 border-t border-neutral-800">
          <div className="relative">
            <div 
              className="flex items-center space-x-3 px-2 cursor-pointer hover:bg-neutral-800 rounded-lg p-2 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs overflow-hidden">
                {user.user.avatarUrl ? (
                  <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.user.displayName.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">{user.user.displayName}</p>
                <p className="text-[10px] text-neutral-500">{user.user.role}</p>
              </div>
              <ChevronRight size={14} className={`text-neutral-500 transition-transform ${showMobileMenu ? 'rotate-90' : ''}`} />
            </div>
            
            {showMobileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-40">
                  <button
                    onClick={() => {
                      setActiveTab('Profile');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3 border-b border-neutral-800"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('Settings');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-sm font-medium text-neutral-400 hidden sm:block">Pages /</h1>
            <h2 className="text-sm font-medium text-white">{activeTab}</h2>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-6 text-neutral-400">
            <button 
              onClick={() => router.push('/chat/new')}
              className="text-xs font-medium border border-neutral-800 px-2 sm:px-3 py-1.5 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 lg:space-y-12">
          
          {/* Show different content based on active tab */}
          {activeTab === 'Overview' && (
            <>
              {/* Random Illustration */}
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                {currentIllustration && (
                  <>
                    <div className="relative w-full max-w-2xl aspect-square">
                      <Image
                        src={currentIllustration}
                        alt="Dashboard Illustration"
                        fill
                        className="object-contain"
                        priority
                        onError={() => {
                          // If image fails to load, pick another one
                          const remaining = illustrations.filter(i => i !== currentIllustration);
                          if (remaining.length > 0) {
                            const randomIndex = Math.floor(Math.random() * remaining.length);
                            setCurrentIllustration(remaining[randomIndex]);
                          }
                        }}
                      />
                    </div>

                  </>
                )}
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'Notifications' && (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={() => setActiveTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Notifications</h3>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-neutral-400">{notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}</p>
                    <button 
                      onClick={() => {
                        notifications.forEach((n: any) => markNotificationAsRead(n.id));
                      }}
                      className="text-xs text-neutral-400 hover:text-white flex items-center group"
                    >
                      Mark all read <CheckCheck size={14} className="ml-1" />
                    </button>
                  </div>

                  <div className="space-y-0 border-t border-neutral-800">
                    {notifications.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="flex items-center justify-between py-5 border-b border-neutral-800 group cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium group-hover:text-neutral-300 transition-colors">{notif.title}</span>
                          <span className="text-xs text-neutral-500 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No unread notifications</p>
                </div>
              )}
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={() => setActiveTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Settings</h3>
              </div>

              {/* Settings Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-neutral-800">
                <button
                  onClick={() => setActiveSettingsTab('account')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeSettingsTab === 'account'
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  Account
                </button>
                <button
                  onClick={() => setActiveSettingsTab('ai')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeSettingsTab === 'ai'
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  AI Preferences
                </button>
                <button
                  onClick={() => setActiveSettingsTab('profile')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeSettingsTab === 'profile'
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </div>

              {/* Account Settings */}
              {activeSettingsTab === 'account' && (
                <div className="space-y-4">
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">Account Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-neutral-500 block mb-2">Display Name</label>
                        <input 
                          type="text" 
                          value={user.user.displayName}
                          disabled
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 block mb-2">Email</label>
                        <input 
                          type="email" 
                          value={user.user.email}
                          disabled
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500 block mb-2">Role</label>
                        <input 
                          type="text" 
                          value={user.user.role}
                          disabled
                          className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white capitalize"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4 text-white">Danger Zone</h4>
                    <button 
                      onClick={logout}
                      className="text-xs border border-neutral-800 text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* AI Preferences */}
              {activeSettingsTab === 'ai' && (
                <div className="space-y-4">
                  {/* Tone & Style */}
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">Tone & Style</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-2">Base Tone</label>
                        <div className="grid grid-cols-5 gap-2">
                          {['formal', 'friendly', 'casual', 'professional', 'encouraging'].map((tone) => (
                            <button
                              key={tone}
                              onClick={() => setAiSettings({ ...aiSettings, baseTone: tone })}
                              className={`px-3 py-2 rounded border text-xs capitalize ${
                                aiSettings.baseTone === tone
                                  ? 'border-white bg-white text-black'
                                  : 'border-neutral-800 text-white hover:border-white'
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-neutral-500">Warmth</label>
                          <span className="text-xs text-white">{aiSettings.warmth}/10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={aiSettings.warmth}
                          onChange={(e) => setAiSettings({ ...aiSettings, warmth: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-neutral-500">Enthusiasm</label>
                          <span className="text-xs text-white">{aiSettings.enthusiasm}/10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={aiSettings.enthusiasm}
                          onChange={(e) => setAiSettings({ ...aiSettings, enthusiasm: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Formatting */}
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">Formatting</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-2">Emoji Usage</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'none', label: 'None' },
                            { value: 'occasional', label: 'Occasional' },
                            { value: 'frequent', label: 'Frequent' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setAiSettings({ ...aiSettings, emojiUsage: option.value })}
                              className={`px-3 py-2 rounded border text-xs ${
                                aiSettings.emojiUsage === option.value
                                  ? 'border-white bg-white text-black'
                                  : 'border-neutral-800 text-white hover:border-white'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-500 mb-2">Response Length</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['concise', 'balanced', 'detailed'].map((length) => (
                            <button
                              key={length}
                              onClick={() => setAiSettings({ ...aiSettings, responseLength: length })}
                              className={`px-3 py-2 rounded border text-xs capitalize ${
                                aiSettings.responseLength === length
                                  ? 'border-white bg-white text-black'
                                  : 'border-neutral-800 text-white hover:border-white'
                              }`}
                            >
                              {length}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded border border-neutral-800">
                        <div>
                          <div className="text-white text-sm mb-1">Use Headers & Lists</div>
                          <div className="text-xs text-neutral-500">Organize responses with markdown</div>
                        </div>
                        <button
                          onClick={() => setAiSettings({ ...aiSettings, useHeaders: !aiSettings.useHeaders })}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            aiSettings.useHeaders ? 'bg-white' : 'bg-neutral-800'
                          }`}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                            aiSettings.useHeaders ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">Custom Instructions</h4>
                    <textarea
                      value={aiSettings.customInstructions || ''}
                      onChange={(e) => setAiSettings({ ...aiSettings, customInstructions: e.target.value })}
                      placeholder="Add any specific instructions for the AI..."
                      className="w-full h-24 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  {/* Profile Connection */}
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-white text-sm mb-1">Connect Learning Profile</div>
                        <div className="text-xs text-neutral-500">Use your learning goals in AI responses</div>
                      </div>
                      <button
                        onClick={() => setAiSettings({ ...aiSettings, profileEnabled: !aiSettings.profileEnabled })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          aiSettings.profileEnabled ? 'bg-white' : 'bg-neutral-800'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                          aiSettings.profileEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {aiSettings.profileEnabled && (
                      <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">Learning Goals</label>
                          <input
                            type="text"
                            value={userContext.learningGoals || ''}
                            onChange={(e) => setUserContext({ ...userContext, learningGoals: e.target.value })}
                            placeholder="e.g., Master calculus"
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">Interests</label>
                          <input
                            type="text"
                            value={userContext.interests || ''}
                            onChange={(e) => setUserContext({ ...userContext, interests: e.target.value })}
                            placeholder="e.g., Physics, Computer Science"
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={saveAISettings}
                    disabled={savingSettings}
                    className="w-full px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving...' : 'Save AI Settings'}
                  </button>
                </div>
              )}

              {/* Profile */}
              {activeSettingsTab === 'profile' && (
                <div className="space-y-4">
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">Profile Information</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm overflow-hidden">
                          {user.user.avatarUrl ? (
                            <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            user.user.displayName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.user.displayName}</p>
                          <p className="text-xs text-neutral-500 capitalize">{user.user.role}</p>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800 pt-4 space-y-3">
                        {user.profile && (
                          <>
                            {(user.profile as any).firstName && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Full Name</label>
                                <p className="text-sm text-white">{(user.profile as any).firstName} {(user.profile as any).lastName}</p>
                              </div>
                            )}

                            {user.user.role === 'TEACHER' && (user.profile as any).specialization && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Specialization</label>
                                <p className="text-sm text-white">{(user.profile as any).specialization}</p>
                              </div>
                            )}

                            {user.user.role === 'TEACHER' && (user.profile as any).qualification && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Qualification</label>
                                <p className="text-sm text-white">{(user.profile as any).qualification}</p>
                              </div>
                            )}

                            {user.user.role === 'TEACHER' && (user.profile as any).experience && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Experience</label>
                                <p className="text-sm text-white">{(user.profile as any).experience} years</p>
                              </div>
                            )}

                            {user.user.role === 'STUDENT' && (user.profile as any).grade && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Grade</label>
                                <p className="text-sm text-white">{(user.profile as any).grade}</p>
                              </div>
                            )}

                            {user.user.role === 'STUDENT' && (user.profile as any).institution && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Institution</label>
                                <p className="text-sm text-white">{(user.profile as any).institution}</p>
                              </div>
                            )}

                            {user.user.role === 'STUDENT' && (user.profile as any).interests && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Interests</label>
                                <p className="text-sm text-white">{(user.profile as any).interests}</p>
                              </div>
                            )}

                            {user.user.role === 'TEACHER' && (user.profile as any).bio && (
                              <div>
                                <label className="text-xs text-neutral-500 block mb-1">Bio</label>
                                <p className="text-sm text-white">{(user.profile as any).bio}</p>
                              </div>
                            )}
                          </>
                        )}

                        <div>
                          <label className="text-xs text-neutral-500 block mb-1">Member Since</label>
                          <p className="text-sm text-white">
                            {new Date(user.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={() => setActiveTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Profile</h3>
              </div>

              {/* Profile Header */}
              <div className="border border-neutral-800 rounded-lg p-6 mb-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-2xl overflow-hidden">
                    {user.user.avatarUrl ? (
                      <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{user.user.displayName.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{user.user.displayName}</h2>
                    <p className="text-sm text-neutral-400 capitalize">{user.user.role}</p>
                    
                    {/* Followers/Following Stats */}
                    <div className="flex items-center space-x-4 mt-3">
                      {user.user.role === 'TEACHER' && user.profile && (
                        <div className="text-sm">
                          <span className="text-white font-semibold">{(user.profile as any).followersCount || 0}</span>
                          <span className="text-neutral-500 ml-1">Followers</span>
                        </div>
                      )}
                      {user.user.role === 'STUDENT' && user.profile && (
                        <div className="text-sm">
                          <span className="text-white font-semibold">{(user.profile as any).followingCount || 0}</span>
                          <span className="text-neutral-500 ml-1">Following</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-neutral-500" />
                    <span className="text-white">{user.user.email}</span>
                  </div>
                  {user.user.lastLoginAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar size={16} className="text-neutral-500" />
                      <span className="text-neutral-400">
                        Last active {new Date(user.user.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                {user.profile && (
                  <>
                    {(user.profile as any).firstName && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <Award size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-1">Full Name</p>
                            <p className="text-sm text-white font-medium">
                              {(user.profile as any).firstName} {(user.profile as any).lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Teacher Specific */}
                    {user.user.role === 'TEACHER' && (user.profile as any).specialization && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-2">Specialization</p>
                            <div className="flex flex-wrap gap-2">
                              {(user.profile as any).specialization.split(',').map((spec: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-xs"
                                >
                                  {spec.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).qualification && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <GraduationCap size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-2">Qualifications</p>
                            <div className="flex flex-wrap gap-2">
                              {(user.profile as any).qualification.split(',').map((qual: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-xs"
                                >
                                  {qual.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).experience && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <Calendar size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-1">Experience</p>
                            <p className="text-sm text-white font-medium">{(user.profile as any).experience} years</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).bio && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-2">About</p>
                            <p className="text-sm text-white leading-relaxed">{(user.profile as any).bio}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student Specific */}
                    {user.user.role === 'STUDENT' && (user.profile as any).grade && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <GraduationCap size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-1">Grade</p>
                            <p className="text-sm text-white font-medium">{(user.profile as any).grade}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user.role === 'STUDENT' && (user.profile as any).institution && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <Building size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-1">Institution</p>
                            <p className="text-sm text-white font-medium">{(user.profile as any).institution}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user.role === 'STUDENT' && (user.profile as any).interests && (
                      <div className="border border-neutral-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <BookOpen size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-2">Interests</p>
                            <div className="flex flex-wrap gap-2">
                              {(user.profile as any).interests.split(',').map((interest: string, index: number) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-xs"
                                >
                                  {interest.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Member Since */}
                <div className="border border-neutral-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                      <Calendar size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500 mb-1">Member Since</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(user.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  Zap
} from 'lucide-react';
import { aiAPI } from '@/lib/ai-api';
import { apiClient } from '@/lib/api';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadNotifications();
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
          <span className="font-bold tracking-tight text-lg">KNOVER.</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" onClick={() => setActiveTab('Overview')} />
          <NavItem icon={BarChart3} label="Analytics" onClick={() => setActiveTab('Analytics')} />
          <NavItem icon={Users} label="Community" onClick={() => setActiveTab('Community')} />
          <NavItem icon={Settings} label="Settings" onClick={() => router.push('/settings')} />
        </nav>

        <div className="pt-6 border-t border-neutral-800">
          <div className="flex items-center space-x-3 px-2 cursor-pointer" onClick={() => router.push('/profile')}>
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs overflow-hidden">
              {user.user.avatarUrl ? (
                <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
              ) : (
                user.user.displayName.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-xs font-semibold">{user.user.displayName}</p>
              <p className="text-[10px] text-neutral-500">{user.user.role}</p>
            </div>
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
            <Search size={18} className="cursor-pointer hover:text-white transition-colors hidden sm:block" />
            <div 
              onClick={() => router.push('/notifications')}
              className="relative cursor-pointer hover:text-white transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block"></div>
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
          
          {/* Welcome Section */}
          <div>
            <h3 className="text-xl sm:text-2xl font-light tracking-tight mb-2">Welcome back, {user.user.displayName.split(' ')[0]}.</h3>
            <p className="text-neutral-500 text-xs sm:text-sm">Here is what is happening with your projects today.</p>
          </div>

          {/* Stats Divider Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-neutral-800">
            <div className="py-6 sm:py-8 px-4 sm:pr-8 border-b md:border-b-0 md:border-r border-neutral-800">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase tracking-widest text-neutral-500">Total Tokens Used</span>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-medium tracking-tight">{stats.tokensUsed.toLocaleString()}</span>
                <span className="text-[10px] text-neutral-500">Lifetime</span>
              </div>
            </div>
            
            <div className="py-6 sm:py-8 px-4 sm:px-8 border-b md:border-b-0 md:border-r border-neutral-800">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase tracking-widest text-neutral-500">Study Plans</span>
                <Activity size={14} className="text-neutral-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-medium tracking-tight">{stats.totalStudyPlans.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-neutral-500">Active</span>
              </div>
            </div>

            <div className="py-6 sm:py-8 px-4 sm:pl-8">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs uppercase tracking-widest text-neutral-500">Quizzes Taken</span>
                <Brain size={14} className="text-neutral-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-medium tracking-tight">{stats.totalQuizzes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] text-neutral-500">Last 7 days</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h4 className="text-sm font-medium uppercase tracking-widest text-neutral-500">Notifications</h4>
                <button className="text-xs text-neutral-400 hover:text-white flex items-center group">
                  Mark all read <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="space-y-0 border-t border-neutral-800">
                {notifications.slice(0, 2).map((notif: any) => (
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
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h4 className="text-sm font-medium uppercase tracking-widest text-neutral-500">Recent Activity</h4>
              <button 
                onClick={() => router.push('/chat/new')}
                className="text-xs text-neutral-400 hover:text-white flex items-center group"
              >
                View all <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-0 border-t border-neutral-800">
              {recentActivity.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-neutral-800 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">No recent activity</p>
                  <button
                    onClick={() => router.push('/chat/new')}
                    className="mt-4 text-xs underline underline-offset-4 hover:text-white text-neutral-400 transition-colors"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                recentActivity.slice(0, 5).map((activity: any) => (
                  <div 
                    key={activity.id} 
                    onClick={() => router.push(`/chat/${activity.id}`)}
                    className="flex items-center justify-between py-5 border-b border-neutral-800 group cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium group-hover:text-neutral-300 transition-colors">
                        {activity.title || 'Untitled Conversation'}
                      </span>
                      <span className="text-xs text-neutral-500 mt-1">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-[10px] border border-neutral-800 px-2 py-0.5 rounded text-neutral-500 uppercase tracking-tighter">
                        {activity.topic || 'Chat'}
                      </span>
                      <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
             <div 
               onClick={() => router.push('/chat/new')}
               className="p-6 sm:p-8 border border-neutral-800 flex flex-col justify-center items-center text-center space-y-3 sm:space-y-4 hover:bg-neutral-950 transition-colors cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2">
                  <Brain size={20} className="text-neutral-400" />
                </div>
                <h5 className="text-sm font-medium">Quick Quiz</h5>
                <p className="text-xs text-neutral-500 max-w-[200px]">Test your knowledge with AI-generated quizzes.</p>
                <button className="text-xs underline underline-offset-4 hover:text-white text-neutral-400 transition-colors">Start Session</button>
             </div>
             
             <div 
               onClick={() => router.push('/profile')}
               className="p-6 sm:p-8 border border-neutral-800 flex flex-col justify-center items-center text-center space-y-3 sm:space-y-4 hover:bg-neutral-950 transition-colors cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2">
                  <BarChart3 size={20} className="text-neutral-400" />
                </div>
                <h5 className="text-sm font-medium">Weekly Progress</h5>
                <p className="text-xs text-neutral-500 max-w-[200px]">Track your learning journey and achievements.</p>
                <button className="text-xs underline underline-offset-4 hover:text-white text-neutral-400 transition-colors">View Report</button>
             </div>
          </div>

        </section>
      </main>
    </div>
  );
}

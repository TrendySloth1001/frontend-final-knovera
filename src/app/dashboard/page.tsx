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
import { apiClient, teacherApi } from '@/lib/api';
import Drawer from '@/components/Drawer';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingTeachers, setFollowingTeachers] = useState<Set<string>>(new Set());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherProfileLoading, setTeacherProfileLoading] = useState(false);
  const [showFollowingDrawer, setShowFollowingDrawer] = useState(false);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followingListLoading, setFollowingListLoading] = useState(false);
  const [showFollowersDrawer, setShowFollowersDrawer] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followersListLoading, setFollowersListLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);

  const illustrations = [
    '/illustrations/Exams-cuate.png',
    '/illustrations/Knowledge-cuate.png',
    '/illustrations/Learning-bro.png',
    '/illustrations/Teaching-cuate.png'
  ];

  // Pick random illustration on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * illustrations.length);
    setCurrentIllustration(illustrations[randomIndex]);

    // Set initial tab from URL hash
    const hash = window.location.hash.slice(1);
    if (hash && !hash.startsWith('teacher/')) {
      const tabName = hash.charAt(0).toUpperCase() + hash.slice(1);
      setActiveTab(tabName);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && !hash.startsWith('teacher/')) {
        const tabName = hash.charAt(0).toUpperCase() + hash.slice(1);
        setActiveTab(tabName);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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
      
      const allNotifications = response.data || [];
      // Filter to show only unread notifications
      const unreadNotifications = allNotifications.filter((n: any) => !n.isRead);
      const newUnreadCount = unreadNotifications.length;
      
      // Update cached count
      previousUnreadCountRef.current = newUnreadCount;
      
      setNotifications(unreadNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Optimistically update UI immediately
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Send request to backend
      await apiClient.patch(`/api/notifications/${notificationId}/read`, { userId: user?.user?.id });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Reload on error to sync state
      loadNotifications();
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

  // Load teachers for Community tab
  const loadTeachers = async (search?: string) => {
    try {
      setTeachersLoading(true);
      const response: any = await teacherApi.getAll({ search, limit: 50 });
      setTeachers(response.data.teachers || []);
      
      // Track which teachers the current user is following
      const following = new Set<string>();
      response.data.teachers.forEach((teacher: any) => {
        if (teacher.isFollowing) {
          following.add(teacher.id);
        }
      });
      setFollowingTeachers(following);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      showNotification('error', 'Failed to load teachers');
    } finally {
      setTeachersLoading(false);
    }
  };

  // Load teacher profile
  const loadTeacherProfile = async (teacherId: string) => {
    try {
      setTeacherProfileLoading(true);
      const response: any = await teacherApi.getById(teacherId);
      setSelectedTeacher(response.data);
      setFollowingTeachers(prev => {
        const next = new Set(prev);
        if (response.data.isFollowing) {
          next.add(teacherId);
        }
        return next;
      });
      // Drawer will open automatically when selectedTeacher is set
    } catch (error: any) {
      console.error('Failed to load teacher:', error);
      showNotification('error', 'Failed to load teacher profile');
      window.location.hash = '';
    } finally {
      setTeacherProfileLoading(false);
    }
  };

  // Follow/unfollow teacher
  const toggleFollowTeacher = async (teacherId: string) => {
    try {
      const isFollowing = followingTeachers.has(teacherId);
      
      if (isFollowing) {
        await teacherApi.unfollow(teacherId);
        setFollowingTeachers(prev => {
          const next = new Set(prev);
          next.delete(teacherId);
          return next;
        });
        window.dispatchEvent(new CustomEvent('teacherFollowUpdate', { detail: { teacherId, isFollowing: false } }));
        showNotification('success', 'Unfollowed teacher');
      } else {
        await teacherApi.follow(teacherId);
        setFollowingTeachers(prev => new Set(prev).add(teacherId));
        window.dispatchEvent(new CustomEvent('teacherFollowUpdate', { detail: { teacherId, isFollowing: true } }));
        showNotification('success', 'Following teacher');
      }
    } catch (error: any) {
      console.error('Follow/unfollow error:', error);
      showNotification('error', error.message || 'Failed to update follow status');
    }
  };

  // Load teachers when Community tab is active
  useEffect(() => {
    if (activeTab === 'Community') {
      loadTeachers();
    }
  }, [activeTab]);

  // Listen for follow state changes
  useEffect(() => {
    const handleFollowUpdate = (event: CustomEvent) => {
      const { teacherId, isFollowing } = event.detail;
      setFollowingTeachers(prev => {
        const next = new Set(prev);
        if (isFollowing) {
          next.add(teacherId);
        } else {
          next.delete(teacherId);
        }
        return next;
      });
      setTeachers(prev => prev.map(t => 
        t.id === teacherId 
          ? { ...t, followersCount: t.followersCount + (isFollowing ? 1 : -1) }
          : t
      ));
      if (selectedTeacher?.id === teacherId) {
        setSelectedTeacher({ ...selectedTeacher, followersCount: selectedTeacher.followersCount + (isFollowing ? 1 : -1), isFollowing });
      }
    };

    window.addEventListener('teacherFollowUpdate' as any, handleFollowUpdate);
    return () => window.removeEventListener('teacherFollowUpdate' as any, handleFollowUpdate);
  }, [selectedTeacher]);

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#teacher/')) {
        const teacherId = hash.replace('#teacher/', '');
        // Ensure we're on the Community tab when viewing a teacher profile
        if (activeTab !== 'Community') {
          setActiveTab('Community');
        }
        setSelectedTeacherId(teacherId);
        loadTeacherProfile(teacherId);
      } else {
        setSelectedTeacherId(null);
        setSelectedTeacher(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Close drawer handler
  const closeTeacherDrawer = () => {
    window.location.hash = '';
    setSelectedTeacher(null);
    setSelectedTeacherId(null);
  };

  // Load following list
  const loadFollowingList = async () => {
    try {
      setFollowingListLoading(true);
      const response: any = await teacherApi.getAll({ limit: 100 });
      // Filter only teachers that the user is following
      const following = response.data.teachers.filter((t: any) => t.isFollowing);
      setFollowingList(following);
      setShowFollowingDrawer(true);
    } catch (error) {
      console.error('Failed to load following list:', error);
      showNotification('error', 'Failed to load following list');
    } finally {
      setFollowingListLoading(false);
    }
  };

  // Load followers list
  const loadFollowersList = async (teacherId: string) => {
    try {
      setFollowersListLoading(true);
      // Call API to get followers of a specific teacher
      const response = await apiClient.get<any>(`/api/teachers/${teacherId}/followers`);
      setFollowersList(response.data || []);
      setShowFollowersDrawer(true);
    } catch (error) {
      console.error('Failed to load followers list:', error);
      showNotification('error', 'Failed to load followers list');
    } finally {
      setFollowersListLoading(false);
    }
  };

  // Helper function to change tab and update URL hash
  const changeTab = (tabName: string) => {
    setActiveTab(tabName);
    window.location.hash = tabName.toLowerCase();
  };

  // Sidebar item component
  const NavItem = ({ icon: Icon, label, onClick }: any) => (
    <div 
      onClick={() => {
        onClick();
        setShowMobileMenu(false);
      }}
      className={`flex items-center space-x-4 py-3 px-2 rounded-lg cursor-pointer transition-colors duration-200 ${
        activeTab === label ? 'text-white bg-neutral-800' : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-neutral-800 flex flex-col p-6 bg-[#000000] transform transition-transform duration-300 lg:transform-none ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center space-x-2 mb-10 px-2">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
          <span className="font-bold tracking-tight text-lg">KNOVERA.</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" onClick={() => changeTab('Overview')} />
          <div className="relative">
            <NavItem icon={Bell} label="Notifications" onClick={() => changeTab('Notifications')} />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <NavItem icon={BarChart3} label="Analytics" onClick={() => changeTab('Analytics')} />
          <NavItem icon={Users} label="Community" onClick={() => changeTab('Community')} />
        </nav>

        <div className="pt-6 border-t border-neutral-800">
          <div className="relative">
            <div 
              className="flex items-center space-x-3 px-2 cursor-pointer hover:bg-neutral-800 rounded-lg p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(!showMobileMenu);
              }}
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
                  className="fixed inset-1z-30" 
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-40">
                  <button
                    onClick={() => {
                      changeTab('Profile');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3 border-b border-neutral-800"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      changeTab('Settings');
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-800 transition-colors flex items-center gap-3 border-b border-neutral-800"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        
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
              className="text-xs sm:text-sm font-medium border border-neutral-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-white hover:text-black transition-all whitespace-nowrap"
            >
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
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
                  onClick={() => changeTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Notifications</h3>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
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
                        className="flex items-start sm:items-center justify-between py-4 sm:py-5 border-b border-neutral-800 group cursor-pointer px-2 sm:px-0"
                      >
                        <div className="flex flex-col flex-1 min-w-0 pr-4">
                          <span className="text-sm font-medium group-hover:text-neutral-300 transition-colors truncate">{notif.title}</span>
                          <span className="text-xs text-neutral-500 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <ArrowUpRight size={16} className="text-neutral-700 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <img 
                    src="/notification/New message-cuate.png" 
                    alt="No notifications" 
                    className="w-120 h-120 mx-auto mb-6 opacity-90"
                  />
                  <p className="text-neutral-500">No unread notifications</p>
                </div>
              )}
            </>
          )}

          {/* Community Tab */}
          {activeTab === 'Community' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => changeTab('Overview')}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h3 className="text-xl font-semibold">Discover Teachers</h3>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4 sm:mb-6">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadTeachers(e.target.value || undefined);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                />
              </div>

              {/* Teachers Grid */}
              {teachersLoading ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">Loading teachers...</p>
                </div>
              ) : teachers.length > 0 ? (
                <div className="space-y-0">
                  {teachers.map((teacher: any, index: number) => {
                    const isOwnProfile = user?.user.id === teacher.userId;
                    const isFollowing = followingTeachers.has(teacher.id);
                    
                    return (
                      <div key={teacher.id}>
                        <div
                          className="py-4 sm:py-6 hover:bg-neutral-950 transition-colors cursor-pointer px-2 sm:px-4 -mx-2 sm:-mx-4"
                          onClick={() => window.location.hash = `teacher/${teacher.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                              {/* Profile Picture */}
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs sm:text-sm overflow-hidden flex-shrink-0">
                                {teacher.user.avatarUrl ? (
                                  <img src={teacher.user.avatarUrl} alt={teacher.user.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  teacher.user.displayName.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              
                              {/* Name and Experience */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">{teacher.user.displayName}</h4>
                                {teacher.experience && (
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-neutral-400">
                                    <Award size={14} />
                                    <span>{teacher.experience} years experience</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Follow Button */}
                            <div className="ml-2 sm:ml-4 flex-shrink-0">
                              {!isOwnProfile ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowTeacher(teacher.id);
                                  }}
                                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded text-xs font-medium transition-colors whitespace-nowrap relative z-10 cursor-pointer ${
                                    isFollowing
                                      ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                                      : 'bg-white text-black hover:bg-neutral-200'
                                  }`}
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  {isFollowing ? 'Following' : 'Follow'}
                                </button>
                              ) : (
                                <div className="px-3 sm:px-5 py-1.5 sm:py-2 rounded text-xs font-medium bg-neutral-900 text-neutral-500 border border-neutral-800 whitespace-nowrap">
                                  You
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < teachers.length - 1 && (
                          <div className="border-b border-neutral-800"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4 text-neutral-700" />
                  <p className="text-neutral-500">
                    {searchQuery ? 'No teachers found matching your search' : 'No teachers available yet'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <>
              <div className="flex items-center space-x-3 mb-6">
                <button
                  onClick={() => changeTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Settings</h3>
              </div>

              {/* Settings Tabs */}
              <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 border-b border-neutral-800 overflow-x-auto">
                <button
                  onClick={() => setActiveSettingsTab('account')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeSettingsTab === 'account'
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  Account
                </button>
                <button
                  onClick={() => setActiveSettingsTab('ai')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                    activeSettingsTab === 'ai'
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  AI Preferences
                </button>
                <button
                  onClick={() => setActiveSettingsTab('profile')}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
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
                      onClick={() => setShowLogoutConfirm(true)}
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

                  {/* Navigate to Full Profile */}
                  <div className="border border-neutral-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium mb-4">View Full Profile</h4>
                    <button 
                      onClick={() => setShowProfileConfirm(true)}
                      className="text-xs border border-neutral-800 text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-all"
                    >
                      Go to Profile
                    </button>
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
                  onClick={() => changeTab('Overview')}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-xl font-semibold">Profile</h3>
              </div>

              {/* Profile Header */}
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-xl sm:text-2xl overflow-hidden flex-shrink-0">
                    {user.user.avatarUrl ? (
                      <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{user.user.displayName.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">{user.user.displayName}</h2>
                    <p className="text-xs sm:text-sm text-neutral-400 capitalize">{user.user.role}</p>
                    
                    {/* Followers/Following Stats */}
                    <div className="flex items-center space-x-4 mt-3">
                      {user.user.role === 'TEACHER' && user.profile && (
                        <>
                          <button
                            onClick={() => loadFollowersList((user.profile as any).id)}
                            className="text-sm hover:opacity-80 transition-opacity"
                          >
                            <span className="text-white font-semibold">{(user.profile as any).followersCount || 0}</span>
                            <span className="text-neutral-500 ml-1">Followers</span>
                          </button>
                          <span className="text-neutral-700">•</span>
                          <button
                            onClick={loadFollowingList}
                            className="text-sm hover:opacity-80 transition-opacity"
                          >
                            <span className="text-white font-semibold">{(user.profile as any).followingCount || 0}</span>
                            <span className="text-neutral-500 ml-1">Following</span>
                          </button>
                        </>
                      )}
                      {user.user.role === 'STUDENT' && user.profile && (
                        <button
                          onClick={loadFollowingList}
                          className="text-sm hover:opacity-80 transition-opacity"
                        >
                          <span className="text-white font-semibold">{(user.profile as any).followingCount || 0}</span>
                          <span className="text-neutral-500 ml-1">Following</span>
                        </button>
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

      {/* Teacher Profile Drawer */}
      <Drawer
        isOpen={!!selectedTeacher}
        onClose={closeTeacherDrawer}
        title="Teacher Profile"
        width="md"
      >
        {selectedTeacher && (
          <div className="p-4 sm:p-6">
            {/* Profile Header */}
            <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 mb-4">
              <div className="flex flex-col items-center sm:items-start gap-4 mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                  {selectedTeacher.user.avatarUrl ? (
                    <img src={selectedTeacher.user.avatarUrl} alt={selectedTeacher.user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{selectedTeacher.user.displayName.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white mb-1 truncate">{selectedTeacher.user.displayName}</h2>
                  {selectedTeacher.specialization && (
                    <p className="text-sm text-neutral-400 mb-3">{selectedTeacher.specialization}</p>
                  )}
                  
                  {/* Followers & Following */}
                  <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4">
                    <button
                      onClick={() => loadFollowersList(selectedTeacher.id)}
                      className="text-sm hover:opacity-80 transition-opacity"
                    >
                      <span className="text-white font-semibold">{selectedTeacher.followersCount || 0}</span>
                      <span className="text-neutral-500 ml-1">Followers</span>
                    </button>
                    {selectedTeacher.followingCount !== undefined && (
                      <>
                        <span className="text-neutral-700">•</span>
                        <button
                          onClick={loadFollowingList}
                          className="text-sm hover:opacity-80 transition-opacity"
                        >
                          <span className="text-white font-semibold">{selectedTeacher.followingCount || 0}</span>
                          <span className="text-neutral-500 ml-1">Following</span>
                        </button>
                      </>
                    )}
                    {selectedTeacher.experience && (
                      <div className="flex items-center gap-1 text-sm text-neutral-400">
                        <Award size={14} />
                        <span>{selectedTeacher.experience} years</span>
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  {user.user.id !== selectedTeacher.userId && (
                    <button
                      onClick={() => toggleFollowTeacher(selectedTeacher.id)}
                      className={`w-full px-6 py-2.5 rounded-lg font-medium transition-colors relative z-10 cursor-pointer ${
                        followingTeachers.has(selectedTeacher.id)
                          ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {followingTeachers.has(selectedTeacher.id) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-neutral-800 pt-4">
                {/* Only show email if viewing own profile */}
                {user.user.id === selectedTeacher.userId && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={16} className="text-neutral-500" />
                    <span className="text-white truncate">{selectedTeacher.user.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar size={16} className="text-neutral-500" />
                  <span className="text-neutral-400">
                    Member since {new Date(selectedTeacher.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              {selectedTeacher.qualification && (
                <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500 mb-3">Qualifications</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacher.qualification.split(',').map((qual: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 rounded border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-sm"
                          >
                            {qual.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTeacher.bio && (
                <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-500 mb-2">About</p>
                      <p className="text-sm text-white leading-relaxed">{selectedTeacher.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Following List Drawer */}
      <Drawer
        isOpen={showFollowingDrawer}
        onClose={() => setShowFollowingDrawer(false)}
        title="Following"
        width="md"
      >
        <div className="p-4 sm:p-6">
          {followingListLoading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : followingList.length > 0 ? (
            <div className="space-y-0">
              {followingList.map((teacher: any, index: number) => (
                <div key={teacher.id}>
                  <div className="py-4 hover:bg-neutral-950 transition-colors rounded-lg px-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                        onClick={() => {
                          setShowFollowingDrawer(false);
                          window.location.hash = `teacher/${teacher.id}`;
                        }}
                      >
                        {/* Profile Picture */}
                        <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                          {teacher.user.avatarUrl ? (
                            <img src={teacher.user.avatarUrl} alt={teacher.user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            teacher.user.displayName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        
                        {/* Name and Experience */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{teacher.user.displayName}</h4>
                          {teacher.experience && (
                            <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
                              <Award size={12} />
                              <span>{teacher.experience} years experience</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollowTeacher(teacher.id);
                        }}
                        className="ml-3 px-4 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 relative z-10 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Following
                      </button>
                    </div>
                  </div>
                  {index < followingList.length - 1 && (
                    <div className="border-b border-neutral-800"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-neutral-700" />
              <p className="text-neutral-500">Not following anyone yet</p>
            </div>
          )}
        </div>
      </Drawer>

      {/* Followers List Drawer */}
      <Drawer
        isOpen={showFollowersDrawer}
        onClose={() => setShowFollowersDrawer(false)}
        title="Followers"
        width="md"
      >
        <div className="p-4 sm:p-6">
          {followersListLoading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading...</p>
            </div>
          ) : followersList.length > 0 ? (
            <div className="space-y-0">
              {followersList.map((follower: any, index: number) => {
                const isTeacher = follower.followerType === 'TEACHER';
                const teacherId = isTeacher ? follower.teacherId : null;
                const isFollowing = teacherId ? followingTeachers.has(teacherId) : false;
                
                return (
                  <div key={follower.id}>
                    <div className="py-4 hover:bg-neutral-950 transition-colors rounded-lg px-2">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (isTeacher && teacherId) {
                              setShowFollowersDrawer(false);
                              window.location.hash = `teacher/${teacherId}`;
                            }
                          }}
                        >
                          {/* Profile Picture */}
                          <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                            {follower.followerAvatar ? (
                              <img src={follower.followerAvatar} alt={follower.followerName} className="w-full h-full object-cover" />
                            ) : (
                              follower.followerName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          
                          {/* Name and Role */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{follower.followerName}</h4>
                            <p className="text-xs text-neutral-400 capitalize">{follower.followerType.toLowerCase()}</p>
                          </div>
                        </div>

                        {/* Follow Button - Only show for teachers */}
                        {isTeacher && teacherId && follower.followerId !== user.user.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollowTeacher(teacherId);
                            }}
                            className={`ml-3 px-4 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                              isFollowing
                                ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                                : 'bg-white text-black hover:bg-neutral-200'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    </div>
                    {index < followersList.length - 1 && (
                      <div className="border-b border-neutral-800"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-neutral-700" />
              <p className="text-neutral-500">No followers yet</p>
            </div>
          )}
        </div>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="warning"
      />

      {/* Profile Navigation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showProfileConfirm}
        title="Go to Profile"
        message="Navigate to your full profile page?"
        confirmText="Go to Profile"
        cancelText="Cancel"
        onConfirm={() => {
          setShowProfileConfirm(false);
          changeTab('Profile');
        }}
        onCancel={() => setShowProfileConfirm(false)}
        variant="info"
      />
    </div>
  );
}

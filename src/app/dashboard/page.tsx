'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import {

  Users,
  BookOpen,
  Mail,
  Calendar,
  GraduationCap,
  Award,
  X,
  Search // Adding search if needed, but X is critical
} from 'lucide-react';
import { aiAPI } from '@/lib/ai-api';
import { apiClient, teacherApi } from '@/lib/api';
import { discoverGroups, searchGroups } from '@/lib/groupDiscoveryApi';
import { createJoinRequest } from '@/lib/groupManagementApi';
import Drawer from '@/components/Drawer';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import AvatarSelectionModal from '@/components/AvatarSelectionModal';
import Sidebar from '@/components/Sidebar';
import OverviewTab from '@/components/dashboard/OverviewTab';
import NotificationsTab from '@/components/dashboard/NotificationsTab';
import CommunityTab from '@/components/dashboard/CommunityTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import MessagesTab from '@/components/dashboard/MessagesTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import DiscoveryTab from '@/components/dashboard/DiscoveryTab';
import PostDetail from '@/components/dashboard/discovery/PostDetail';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Sidebar collapse state
  const [currentIllustration, setCurrentIllustration] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'account' | 'ai' | 'profile'>('account');
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
  const [messageUserId, setMessageUserId] = useState<string | null>(null); // User ID to start messaging with
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Community sub-tab state
  const [communitySubTab, setCommunitySubTab] = useState<'teachers' | 'groups'>('teachers');
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const illustrations = [
    '/illustrations/Exams-cuate.png',
    '/illustrations/Knowledge-cuate.png',
    '/illustrations/Learning-bro.png',
    '/illustrations/Teaching-cuate.png'
  ];

  // Pick random illustration on page load
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Determine active tab from hash
  const getTabFromHash = (hash: string) => {
    const cleanHash = hash.replace('#', '').toLowerCase();

    if (cleanHash.startsWith('messages/') || cleanHash.startsWith('massages/')) {
      return 'Messages';
    }

    if (cleanHash.startsWith('post/')) {
      return null; // Don't change tab, just show overlay
    }

    if (cleanHash.startsWith('teacher/')) {
      return null;
    }

    if (cleanHash.startsWith('discovery')) {
      return 'Discovery';
    }

    switch (cleanHash) {
      case 'notification':
      case 'notifications':
        return 'Notifications';
      case 'messages':
      case 'massages':
        return 'Messages';
      case 'community':
        return 'Community';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      case 'profile':
        return 'Profile';
      case 'discovery':
        return 'Discovery';
      case 'overview':
      default:
        return 'Overview';
    }
  };

  // Pick random illustration on page load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * illustrations.length);
    setCurrentIllustration(illustrations[randomIndex]);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      const tab = getTabFromHash(hash);

      if (tab) {
        setActiveTab(tab);
      }

      // Handle message ID parsing
      if (hash.includes('messages/') || hash.includes('massages/')) {
        const chatId = hash.split('/')[1];
        if (chatId) setMessageUserId(chatId);
      } else if (hash.includes('teacher/')) {
        const teacherId = hash.split('/')[1];
        setSelectedTeacherId(teacherId);
        loadTeacherProfile(teacherId);
      } else if (hash.startsWith('#post/')) {
        const postId = hash.split('/')[1];
        setSelectedPostId(postId);
      } else {
        // Only clear selectedPostId if we strictly navigated away from it
        // and it's not a teacher profile or something that can coexist
        if (!hash.startsWith('#post/')) {
          setSelectedPostId(null);
        }
      }
    };

    // Initial load
    if (!window.location.hash) {
      window.location.hash = 'overview';
    } else {
      onHashChange();
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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

  // Load discoverable groups
  const loadGroups = async (search?: string) => {
    try {
      setGroupsLoading(true);
      console.log('Loading groups with sub-tab:', communitySubTab);
      const category = communitySubTab === 'teachers' ? 'teachers' : undefined;
      console.log('Category filter:', category);
      const groupsList = search
        ? await searchGroups(search)
        : await discoverGroups(category, undefined, 50);
      console.log('Loaded groups:', groupsList?.length || 0, 'groups');
      setGroups(groupsList || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setGroups([]);
      showNotification('error', 'Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  // Handle join group request
  const handleJoinGroup = async (groupId: string, isPublic: boolean) => {
    try {
      if (isPublic) {
        // Direct join for public groups - handled by joinViaInviteLink or similar
        showNotification('info', 'Joining group...');
        // This would need an invite code or different endpoint
        // For now, we'll use join request for all
      }

      // Create join request
      await createJoinRequest(groupId, '');
      showNotification('success', isPublic ? 'Joined group successfully' : 'Join request sent');
      // Reload groups to update status
      loadGroups(groupSearchQuery || undefined);
    } catch (error: any) {
      showNotification('error', error.response?.data?.error || 'Failed to join group');
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

  // Load teachers/groups when Community tab is active
  useEffect(() => {
    if (activeTab === 'Community') {
      if (communitySubTab === 'teachers') {
        loadTeachers();
      } else {
        loadGroups();
      }
    }
  }, [activeTab, communitySubTab]);

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
        // Allow opening drawer on any tab
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
    // We only update the hash, the generic hash listener handles state
    window.location.hash = tabName.toLowerCase();
  };

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    showNotification('success', 'Avatar updated successfully');
    // Refresh the page to update user data
    window.location.reload();
  };

  // Start messaging with a teacher
  const startMessagingWithTeacher = async (teacherUserId: string) => {
    if (!teacherUserId || !user?.user?.id) return;

    // Update hash to trigger navigation and state update via listener
    window.location.hash = `messages/${teacherUserId}`;
  };



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
    <div className="flex w-full min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-neutral-800 overflow-hidden">

      <Sidebar
        activeTab={activeTab}
        changeTab={changeTab}
        unreadCount={unreadCount}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        user={user}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 max-h-screen">

        {/* Header - Show hamburger for Messages on mobile, full header for others */}
        {activeTab === 'Discovery' ? null : activeTab === 'Messages' ? (
          <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 lg:hidden flex-shrink-0">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-medium text-white">Messages</h2>
            <div className="w-9" />{/* Spacer for centering */}
          </header>
        ) : (
          <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-sm font-medium text-white">{activeTab}</h2>
            </div>
          </header>
        )}

        {/* Dashboard Body */}
        <section className={`flex-1 overflow-y-auto overflow-x-hidden w-full ${activeTab === 'Messages' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {activeTab !== 'Messages' && (
            <div className="mx-auto w-full max-w-7xl">
              {/* Show different content based on active tab */}
              {activeTab === 'Overview' && (
                <OverviewTab
                  currentIllustration={currentIllustration}
                  illustrations={illustrations}
                  setCurrentIllustration={setCurrentIllustration}
                />
              )}

              {/* Notifications Tab */}
              {activeTab === 'Notifications' && (
                <NotificationsTab
                  notifications={notifications}
                  changeTab={changeTab}
                  markNotificationAsRead={markNotificationAsRead}
                />
              )}

              {/* Community Tab */}
              {activeTab === 'Community' && (
                <CommunityTab
                  communitySubTab={communitySubTab}
                  setCommunitySubTab={setCommunitySubTab}
                  changeTab={changeTab}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  groupSearchQuery={groupSearchQuery}
                  setGroupSearchQuery={setGroupSearchQuery}
                  loadTeachers={loadTeachers}
                  loadGroups={loadGroups}
                  teachersLoading={teachersLoading}
                  teachers={teachers}
                  user={user}
                  followingTeachers={followingTeachers}
                  toggleFollowTeacher={toggleFollowTeacher}
                  startMessagingWithTeacher={startMessagingWithTeacher}
                  groupsLoading={groupsLoading}
                  groups={groups}
                  handleJoinGroup={handleJoinGroup}
                />
              )}

              {/* Analytics Tab */}
              {activeTab === 'Analytics' && (
                <AnalyticsTab changeTab={changeTab} />
              )}

              {/* Settings Tab */}
              {activeTab === 'Settings' && (
                <SettingsTab
                  changeTab={changeTab}
                  activeSettingsTab={activeSettingsTab}
                  setActiveSettingsTab={setActiveSettingsTab}
                  user={user}
                  setShowLogoutConfirm={setShowLogoutConfirm}
                  aiSettings={aiSettings}
                  setAiSettings={setAiSettings}
                  userContext={userContext}
                  setUserContext={setUserContext}
                  saveAISettings={saveAISettings}
                  savingSettings={savingSettings}
                  setShowProfileConfirm={setShowProfileConfirm}
                />
              )}

              {/* Discovery Tab */}
              {activeTab === 'Discovery' && (
                <DiscoveryTab />
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'Messages' && (
            <MessagesTab
              messageUserId={messageUserId}
              setMessageUserId={setMessageUserId}
              changeTab={changeTab}
            />
          )}

          {/* Profile Tab */}
          {activeTab === 'Profile' && (
            <ProfileTab
              changeTab={changeTab}
              user={user}
              setShowAvatarModal={setShowAvatarModal}
              loadFollowersList={loadFollowersList}
              loadFollowingList={loadFollowingList}
            />
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
                      className={`w-full px-6 py-2.5 rounded-lg font-medium transition-colors relative z-10 cursor-pointer ${followingTeachers.has(selectedTeacher.id)
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
                            className={`ml-3 px-4 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${isFollowing
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

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <AvatarSelectionModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          currentAvatarUrl={user?.user.avatarUrl}
          onAvatarUpdated={handleAvatarUpdated}
        />
      )}

      {/* Global Post Detail Overlay */}
      {selectedPostId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-black border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-end p-4 border-b border-white/10">
              <button
                onClick={() => {
                  setSelectedPostId(null);
                  // Restore hash logic: go back or default to active tab
                  if (window.history.length > 1) {
                    // Check if prev hash was same tab, safe to back
                    window.history.back();
                  } else {
                    changeTab(activeTab);
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <PostDetail postId={selectedPostId} onBack={() => {
                setSelectedPostId(null);
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  changeTab(activeTab);
                }
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
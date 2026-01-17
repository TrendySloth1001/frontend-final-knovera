import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Award, BookOpen, GraduationCap, Building, Edit2, MessageSquare, ThumbsUp, FileText, TrendingUp } from 'lucide-react';
import { apiClient, authAPI } from '@/lib/api';
import ProfileEditSidebar from './ProfileEditSidebar';
import ProfilePosts from './ProfilePosts';

interface ProfileTabProps {
  changeTab: (tab: string) => void;
  user: any;
  setShowAvatarModal: (show: boolean) => void;
  loadFollowersList: (teacherId: string) => Promise<void>;
  loadFollowingList: () => Promise<void>;
}

interface DiscoveryStats {
  posts: number;
  comments: number;
  votes: number;
  totalEngagement: number;
}

export default function ProfileTab({
  changeTab,
  user,
  setShowAvatarModal,
  loadFollowersList,
  loadFollowingList,
}: ProfileTabProps) {
  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [subTab, setSubTab] = useState<'about' | 'posts'>('about');

  useEffect(() => {
    const fetchDiscoveryStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get<any>(`/api/discover/users/${user.user.id}/stats`);
        setDiscoveryStats(response.data || { posts: 0, comments: 0, votes: 0, totalEngagement: 0 });
      } catch (error) {
        console.error('Failed to fetch discovery stats:', error);
        setDiscoveryStats({ posts: 0, comments: 0, votes: 0, totalEngagement: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.user?.id) {
      fetchDiscoveryStats();
    }
  }, [user?.user?.id]);

  const handleProfileUpdated = async () => {
    // Refresh user data after profile update
    try {
      await authAPI.getMe();
      // The parent component should handle reloading user data
      window.location.reload(); // Simple approach for now
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => changeTab('Overview')}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xl font-semibold">Profile</h3>
          </div>
          <button
            onClick={() => setShowEditSidebar(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>

        {/* Profile Header */}
        <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative group flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-xl sm:text-2xl overflow-hidden">
                {user.user.avatarUrl ? (
                  <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{user.user.displayName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change avatar"
              >
                <User size={20} className="text-white" />
              </button>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-800">
          <button
            onClick={() => setSubTab('about')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${subTab === 'about'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-500 hover:text-white'
              }`}
          >
            About
          </button>
          <button
            onClick={() => setSubTab('posts')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${subTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-500 hover:text-white'
              }`}
          >
            Posts
          </button>
        </div>

        {/* Tab Content */}
        {subTab === 'about' ? (
          <div className="space-y-4">

            {/* Simplified Discovery Activity */}
            <div className="border border-neutral-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 mb-2">Discovery Activity</p>
                  <div className="flex flex-wrap gap-4 sm:gap-8">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-white">{discoveryStats?.posts || 0}</span>
                      <span className="text-sm text-neutral-400">Posts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-green-500" />
                      <span className="text-sm font-bold text-white">{discoveryStats?.comments || 0}</span>
                      <span className="text-sm text-neutral-400">Comments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp size={16} className="text-purple-500" />
                      <span className="text-sm font-bold text-white">{discoveryStats?.votes || 0}</span>
                      <span className="text-sm text-neutral-400">Votes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-orange-500" />
                      <span className="text-sm font-bold text-white">{discoveryStats?.totalEngagement || 0}</span>
                      <span className="text-sm text-neutral-400">Engagement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
        ) : (
          <ProfilePosts userId={user.user.id} />
        )}

        {/* Profile Edit Sidebar */}
        <ProfileEditSidebar
          isOpen={showEditSidebar}
          onClose={() => setShowEditSidebar(false)}
          userRole={user.user.role}
          profileId={user.profile?.id || ''}
          currentProfile={user.profile}
          onProfileUpdated={handleProfileUpdated}
        />
      </>
    </div>
  );
}

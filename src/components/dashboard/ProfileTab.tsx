import { ArrowLeft, User, Mail, Calendar, Award, BookOpen, GraduationCap, Building } from 'lucide-react';

interface ProfileTabProps {
  changeTab: (tab: string) => void;
  user: any;
  setShowAvatarModal: (show: boolean) => void;
  loadFollowersList: (teacherId: string) => Promise<void>;
  loadFollowingList: () => Promise<void>;
}

export default function ProfileTab({
  changeTab,
  user,
  setShowAvatarModal,
  loadFollowersList,
  loadFollowingList,
}: ProfileTabProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
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
    </div>
  );
}

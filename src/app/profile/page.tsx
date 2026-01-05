/**
 * Profile Page
 * Modern profile with black background and white text
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { TeacherProfile, StudentProfile } from '@/types/auth';
import { Mail, Calendar, Users, BookOpen, Award, GraduationCap, Building, ArrowLeft, LogOut, Edit } from 'lucide-react';

const TAG_COLORS = [
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-green-500/20 border-green-500/40 text-green-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
  'bg-red-500/20 border-red-500/40 text-red-300',
];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isTeacher = user.user.role === 'TEACHER';
  const profile = user.profile;
  const teacherProfile = isTeacher ? (profile as TeacherProfile) : null;
  const studentProfile = !isTeacher ? (profile as StudentProfile) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/20 flex-shrink-0 shadow-xl">
                {user.user.avatarUrl ? (
                  <img 
                    src={user.user.avatarUrl} 
                    alt={user.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl text-white font-bold">
                      {user.user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Header Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {user.user.displayName}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white text-sm rounded-full font-medium">
                  {user.user.role}
                </span>
                {user.user.isActive && (
                  <span className="px-4 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-sm rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-white/70">
                  <Mail size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate">{user.user.email}</span>
                </div>

                {user.user.lastLoginAt && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-white/50">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span className="text-sm">
                      Last active {new Date(user.user.lastLoginAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {isTeacher && teacherProfile && (
        <div className="border-b border-white/10 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-black rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">{teacherProfile.followersCount}</div>
                <div className="text-sm text-white/60 font-medium">Followers</div>
              </div>
              <div className="text-center p-4 bg-black rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">{teacherProfile.contentCount}</div>
                <div className="text-sm text-white/60 font-medium">Content</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isTeacher && studentProfile && (
        <div className="border-b border-white/10 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="text-center p-4 bg-black rounded-xl border border-white/10">
              <div className="text-3xl font-bold text-white mb-1">{studentProfile.followingCount}</div>
              <div className="text-sm text-white/60 font-medium">Following</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Bio/About Section */}
        {teacherProfile?.bio && (
          <section className="mb-10 p-6 bg-black rounded-2xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              About
            </h2>
            <p className="text-white/80 leading-relaxed">{teacherProfile.bio}</p>
          </section>
        )}

        {studentProfile?.interests && (
          <section className="mb-10 p-6 bg-black rounded-2xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {studentProfile.interests.split(',').map((interest, index) => {
                const colorClass = TAG_COLORS[index % TAG_COLORS.length];
                return (
                  <span 
                    key={index}
                    className={`px-3 py-1.5 rounded-lg border ${colorClass}`}
                  >
                    {interest.trim()}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Details Section */}
        <section className="p-6 bg-black rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-6">Profile Details</h2>
          
          <div className="space-y-5">
            {/* Full Name */}
            <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Full Name</div>
                <div className="text-white font-medium">
                  {teacherProfile ? `${teacherProfile.firstName} ${teacherProfile.lastName}` : 
                   studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Teacher Specific Fields */}
            {teacherProfile?.specialization && (
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Specializations</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacherProfile.specialization.split(',').map((spec, index) => {
                      const colorClass = TAG_COLORS[index % TAG_COLORS.length];
                      return (
                        <span 
                          key={index}
                          className={`px-3 py-1.5 rounded-lg border ${colorClass}`}
                        >
                          {spec.trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {teacherProfile?.qualification && (
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Qualifications</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teacherProfile.qualification.split(',').map((qual, index) => {
                      const colorClass = TAG_COLORS[index % TAG_COLORS.length];
                      return (
                        <span 
                          key={index}
                          className={`px-3 py-1.5 rounded-lg border ${colorClass}`}
                        >
                          {qual.trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {teacherProfile?.experience && (
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Experience</div>
                  <div className="text-white font-medium">{teacherProfile.experience} years</div>
                </div>
              </div>
            )}

            {/* Student Specific Fields */}
            {studentProfile?.grade && (
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Grade</div>
                  <div className="text-white font-medium">{studentProfile.grade}</div>
                </div>
              </div>
            )}

            {studentProfile?.institution && (
              <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Building size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Institution</div>
                  <div className="text-white font-medium">{studentProfile.institution}</div>
                </div>
              </div>
            )}

            {/* Account Created */}
            <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">Member Since</div>
                <div className="text-white font-medium">
                  {new Date(user.user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

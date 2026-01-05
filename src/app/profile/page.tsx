/**
 * Profile Page
 * Modern profile with black background and white text
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { TeacherProfile, StudentProfile } from '@/types/auth';
import { Mail, Calendar, Users, BookOpen, Award, GraduationCap, Building } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const isTeacher = user.user.role === 'TEACHER';
  const profile = user.profile;
  const teacherProfile = isTeacher ? (profile as TeacherProfile) : null;
  const studentProfile = !isTeacher ? (profile as StudentProfile) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
              {user.user.avatarUrl ? (
                <img 
                  src={user.user.avatarUrl} 
                  alt={user.user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <span className="text-5xl text-white font-semibold">
                    {user.user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.user.displayName}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                  {user.user.role}
                </span>
                {user.user.isActive && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-white/60 mb-3">
                <Mail size={16} />
                <span className="text-sm">{user.user.email}</span>
              </div>

              {user.user.lastLoginAt && (
                <div className="flex items-center gap-2 text-white/40">
                  <Calendar size={16} />
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

      {/* Stats Section */}
      {isTeacher && teacherProfile && (
        <div className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{teacherProfile.followersCount}</div>
                <div className="text-sm text-white/60">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{teacherProfile.contentCount}</div>
                <div className="text-sm text-white/60">Content</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isTeacher && studentProfile && (
        <div className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{studentProfile.followingCount}</div>
                <div className="text-sm text-white/60">Following</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Bio/About Section */}
        {teacherProfile?.bio && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <p className="text-white/80 leading-relaxed">{teacherProfile.bio}</p>
          </section>
        )}

        {studentProfile?.interests && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">Interests</h2>
            <p className="text-white/80 leading-relaxed">{studentProfile.interests}</p>
          </section>
        )}

        {/* Details Section */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">Details</h2>
          
          <div className="space-y-6">
            {/* Full Name */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-white/60" />
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Full Name</div>
                <div className="text-white">
                  {teacherProfile ? `${teacherProfile.firstName} ${teacherProfile.lastName}` : 
                   studentProfile ? `${studentProfile.firstName} ${studentProfile.lastName}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Teacher Specific Fields */}
            {teacherProfile?.specialization && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Specialization</div>
                  <div className="text-white">{teacherProfile.specialization}</div>
                </div>
              </div>
            )}

            {teacherProfile?.qualification && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Qualification</div>
                  <div className="text-white">{teacherProfile.qualification}</div>
                </div>
              </div>
            )}

            {teacherProfile?.experience && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Experience</div>
                  <div className="text-white">{teacherProfile.experience} years</div>
                </div>
              </div>
            )}

            {/* Student Specific Fields */}
            {studentProfile?.grade && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Grade</div>
                  <div className="text-white">{studentProfile.grade}</div>
                </div>
              </div>
            )}

            {studentProfile?.institution && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Building size={18} className="text-white/60" />
                </div>
                <div>
                  <div className="text-sm text-white/40 mb-1">Institution</div>
                  <div className="text-white">{studentProfile.institution}</div>
                </div>
              </div>
            )}

            {/* Account Created */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-white/60" />
              </div>
              <div>
                <div className="text-sm text-white/40 mb-1">Member Since</div>
                <div className="text-white">
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

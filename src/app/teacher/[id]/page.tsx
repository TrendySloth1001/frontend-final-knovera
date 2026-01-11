'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { teacherApi } from '@/lib/api';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  Building
} from 'lucide-react';

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const teacherId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTeacherProfile();
  }, [teacherId, isAuthenticated]);

  const loadTeacherProfile = async () => {
    try {
      setLoading(true);
      const response: any = await teacherApi.getById(teacherId);
      setTeacher(response.data);
      setFollowing(response.data.isFollowing || false);
    } catch (error: any) {
      console.error('Failed to load teacher profile:', error);
      showNotification('error', 'Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      showNotification('error', 'Please login to follow teachers');
      return;
    }

    try {
      setFollowLoading(true);
      
      if (following) {
        await teacherApi.unfollow(teacherId);
        setFollowing(false);
        setTeacher({ ...teacher, followersCount: teacher.followersCount - 1 });
        showNotification('success', 'Unfollowed teacher');
      } else {
        await teacherApi.follow(teacherId);
        setFollowing(true);
        setTeacher({ ...teacher, followersCount: teacher.followersCount + 1 });
        showNotification('success', 'Following teacher');
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      showNotification('error', error.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-neutral-500">Loading profile...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-neutral-500">Teacher not found</div>
      </div>
    );
  }

  const isOwnProfile = user?.user.id === teacher.userId;

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-black sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="border border-neutral-800 rounded-lg p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
              {teacher.user.avatarUrl ? (
                <img 
                  src={teacher.user.avatarUrl} 
                  alt={teacher.user.displayName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white font-bold">
                  {teacher.user.displayName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{teacher.user.displayName}</h1>
              {teacher.specialization && (
                <p className="text-lg text-neutral-400 mb-3">{teacher.specialization}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-white font-semibold">{teacher.followersCount || 0}</span>
                  <span className="text-neutral-500 ml-1">Followers</span>
                </div>
                {teacher.experience && (
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Award size={16} />
                    <span>{teacher.experience} years experience</span>
                  </div>
                )}
              </div>
            </div>

            {/* Follow Button */}
            {user && !isOwnProfile && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  following
                    ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
              </button>
            )}

            {isOwnProfile && (
              <div className="px-6 py-2.5 rounded-lg font-medium bg-neutral-900 text-neutral-500 border border-neutral-800">
                Your Profile
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 mb-1">Email</p>
                <p className="text-sm text-white truncate">{teacher.user.email}</p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Member Since</p>
                <p className="text-sm text-white">
                  {new Date(teacher.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Qualification */}
          {teacher.qualification && (
            <div className="border border-neutral-800 rounded-lg p-6 md:col-span-2">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 mb-3">Qualifications</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.qualification.split(',').map((qual: string, index: number) => (
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

          {/* Bio */}
          {teacher.bio && (
            <div className="border border-neutral-800 rounded-lg p-6 md:col-span-2">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 mb-2">About</p>
                  <p className="text-sm text-white leading-relaxed">{teacher.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import { Mail, UserCircle, Calendar, GraduationCap, Award, BookOpen, Building } from 'lucide-react';
import { ChatUser } from '@/types/chat';

interface ProfileDrawerContentProps {
  selectedProfileUser: ChatUser | null;
  profileLoading: boolean;
  profileData: any;
}

export default function ProfileDrawerContent({
  selectedProfileUser,
  profileLoading,
  profileData,
}: ProfileDrawerContentProps) {
  if (!selectedProfileUser) return null;

  return (
    <div className="p-4 sm:p-6">
      {profileLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading profile...</p>
        </div>
      ) : profileData ? (
        <>
          {/* Profile Header */}
          <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 mb-4">
            <div className="flex flex-col items-center sm:items-start gap-4 mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-neutral-700 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                {selectedProfileUser.avatarUrl ? (
                  <img src={selectedProfileUser.avatarUrl} alt={selectedProfileUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{selectedProfileUser.displayName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-1 truncate">{selectedProfileUser.displayName}</h2>
                {selectedProfileUser.username && (
                  <p className="text-sm text-neutral-400 mb-2">@{selectedProfileUser.username}</p>
                )}
                {profileData.type === 'teacher' && profileData.specialization && (
                  <p className="text-sm text-neutral-400 mb-3">{profileData.specialization}</p>
                )}
                {profileData.type && (
                  <div className="inline-block px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-300 capitalize mb-3">
                    {profileData.type}
                  </div>
                )}
                
                {/* Status */}
                <div className="flex items-center justify-center sm:justify-start gap-2 py-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedProfileUser.isOnline ? 'bg-green-500' : 'bg-neutral-600'
                  }`} />
                  <span className="text-sm text-neutral-300">
                    {selectedProfileUser.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Stats for Teachers */}
                {profileData.type === 'teacher' && (
                  <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4">
                    <div className="text-sm">
                      <span className="text-white font-semibold">{profileData.followersCount || 0}</span>
                      <span className="text-neutral-500 ml-1">Followers</span>
                    </div>
                    {profileData.followingCount !== undefined && (
                      <>
                        <span className="text-neutral-700">•</span>
                        <div className="text-sm">
                          <span className="text-white font-semibold">{profileData.followingCount || 0}</span>
                          <span className="text-neutral-500 ml-1">Following</span>
                        </div>
                      </>
                    )}
                    {profileData.experience && (
                      <>
                        <span className="text-neutral-700">•</span>
                        <div className="flex items-center gap-1 text-sm text-neutral-400">
                          <Award size={14} />
                          <span>{profileData.experience} years</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Stats for Students */}
                {profileData.type === 'student' && profileData.followingCount !== undefined && (
                  <div className="flex items-center justify-center sm:justify-start mb-4">
                    <div className="text-sm">
                      <span className="text-white font-semibold">{profileData.followingCount || 0}</span>
                      <span className="text-neutral-500 ml-1">Following</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-800 pt-4">
              {selectedProfileUser.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail size={16} className="text-neutral-500" />
                  <span className="text-white truncate">{selectedProfileUser.email}</span>
                </div>
              )}
              {selectedProfileUser.username && (
                <div className="flex items-center space-x-2 text-sm">
                  <UserCircle size={16} className="text-neutral-500" />
                  <span className="text-neutral-400">@{selectedProfileUser.username}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <Calendar size={16} className="text-neutral-500" />
                <span className="text-neutral-400">
                  Member since {new Date(profileData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {selectedProfileUser.lastActiveAt && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar size={16} className="text-neutral-500" />
                  <span className="text-neutral-400">
                    Last active {new Date(selectedProfileUser.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {/* Teacher Qualifications */}
            {profileData.type === 'teacher' && profileData.qualification && (
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-3">Qualifications</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.qualification.split(',').map((qual: string, index: number) => (
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

            {/* Teacher Bio */}
            {profileData.type === 'teacher' && profileData.bio && (
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-2">About</p>
                    <p className="text-sm text-white leading-relaxed">{profileData.bio}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Grade */}
            {profileData.type === 'student' && profileData.grade && (
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-1">Grade</p>
                    <p className="text-sm text-white font-medium">{profileData.grade}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Institution */}
            {profileData.type === 'student' && profileData.institution && (
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                    <Building size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-1">Institution</p>
                    <p className="text-sm text-white font-medium">{profileData.institution}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Interests */}
            {profileData.type === 'student' && profileData.interests && (
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-3">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.split(',').map((interest: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 rounded border border-neutral-700 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white text-sm"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-500">Unable to load profile details</p>
        </div>
      )}
    </div>
  );
}

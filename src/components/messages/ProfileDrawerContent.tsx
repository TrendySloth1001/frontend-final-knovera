import { useState } from 'react';
import { Mail, UserCircle, Calendar, GraduationCap, Award, BookOpen, Building, MapPin, Link as LinkIcon, Twitter, Linkedin, Github } from 'lucide-react';
import { ChatUser } from '@/types/chat';
import SharedMediaView from './SharedMediaView';

interface ProfileDrawerContentProps {
  selectedProfileUser: ChatUser | null;
  profileLoading: boolean;
  profileData: any;
  currentUserId: string; // Add this prop to access authToken
  authToken: string;
  conversationId?: string;
}

export default function ProfileDrawerContent({
  selectedProfileUser,
  profileLoading,
  profileData,
  authToken,
  conversationId
}: ProfileDrawerContentProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'media'>('info');

  if (!selectedProfileUser) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'info' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Info
          {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
        </button>
        {conversationId && (
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'media' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Shared Media
            {activeTab === 'media' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        )}
      </div>

      {activeTab === 'info' ? (
        <div className="p-6 space-y-8 overflow-y-auto text-zinc-100 flex-1">
          {profileLoading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <div className="w-24 h-24 bg-zinc-900 rounded-full mb-4" />
              <div className="h-6 w-48 bg-zinc-900 rounded mb-2" />
              <div className="h-4 w-32 bg-zinc-900 rounded" />
            </div>
          ) : profileData ? (
            <>
              {/* Header Section */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6 group">
                  <div className="w-28 h-28 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl overflow-hidden shadow-xl shadow-black/50 transition-transform duration-300 group-hover:scale-105">
                    {selectedProfileUser.avatarUrl ? (
                      <img src={selectedProfileUser.avatarUrl} alt={selectedProfileUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-zinc-400 font-medium tracking-wider">{selectedProfileUser.displayName.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  {selectedProfileUser.isOnline && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#0a0a0a] rounded-full" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{selectedProfileUser.displayName}</h2>

                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                  {selectedProfileUser.username && (
                    <span>@{selectedProfileUser.username}</span>
                  )}
                  {profileData.type && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="capitalize">{profileData.type}</span>
                    </>
                  )}
                </div>

                {/* Stats Row */}
                {(profileData.followersCount !== undefined || profileData.followingCount !== undefined) && (
                  <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">{profileData.followersCount || 0}</div>
                      <div className="text-zinc-600 text-xs uppercase tracking-wider font-medium">Followers</div>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">{profileData.followingCount || 0}</div>
                      <div className="text-zinc-600 text-xs uppercase tracking-wider font-medium">Following</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact & Info Box */}
              <div className="border border-zinc-800/50 rounded-2xl overflow-hidden">
                <div className="bg-zinc-900/30 px-5 py-3 border-b border-zinc-800/50">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Information</h3>
                </div>
                <div className="divide-y divide-zinc-800/50 bg-[#0c0c0c]">
                  {selectedProfileUser.email && (
                    <div className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-900/20 transition-colors">
                      <div className="p-2 rounded-lg bg-zinc-900/50 text-zinc-400">
                        <Mail size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-500 mb-0.5">Email</div>
                        <div className="text-zinc-200 text-sm truncate">{selectedProfileUser.email}</div>
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-900/20 transition-colors">
                    <div className="p-2 rounded-lg bg-zinc-900/50 text-zinc-400">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-zinc-500 mb-0.5">Joined</div>
                      <div className="text-zinc-200 text-sm">
                        {new Date(profileData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {selectedProfileUser.lastActiveAt && (
                    <div className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-900/20 transition-colors">
                      <div className="p-2 rounded-lg bg-zinc-900/50 text-zinc-400">
                        <UserCircle size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-500 mb-0.5">Last Active</div>
                        <div className="text-zinc-200 text-sm">
                          {new Date(selectedProfileUser.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Specific Details */}
              {profileData.type === 'teacher' && (
                <div className="space-y-6">
                  {profileData.bio && (
                    <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-[#0c0c0c]">
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3 mb-3 text-zinc-400">
                          <BookOpen size={18} />
                          <span className="text-sm font-medium text-zinc-300">About</span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{profileData.bio}</p>
                      </div>
                    </div>
                  )}

                  {profileData.qualification && (
                    <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-[#0c0c0c]">
                      <div className="px-5 py-4">
                        <div className="flex items-center gap-3 mb-4 text-zinc-400">
                          <GraduationCap size={18} />
                          <span className="text-sm font-medium text-zinc-300">Qualifications</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileData.qualification.split(',').map((qual: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                              {qual.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Student Specific Details */}
              {profileData.type === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  {profileData.grade && (
                    <div className="border border-zinc-800/50 rounded-2xl p-4 bg-[#0c0c0c] flex flex-col items-center justify-center text-center">
                      <div className="mb-2 p-2 rounded-full bg-zinc-900/50 text-zinc-400">
                        <GraduationCap size={20} />
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Grade</div>
                      <div className="font-semibold text-white">{profileData.grade}</div>
                    </div>
                  )}
                  {profileData.institution && (
                    <div className="border border-zinc-800/50 rounded-2xl p-4 bg-[#0c0c0c] flex flex-col items-center justify-center text-center">
                      <div className="mb-2 p-2 rounded-full bg-zinc-900/50 text-zinc-400">
                        <Building size={20} />
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Institution</div>
                      <div className="font-semibold text-white truncate w-full px-2">{profileData.institution}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Interests Section */}
              {profileData.interests && (
                <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-[#0c0c0c]">
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-4 text-zinc-400">
                      <Award size={18} />
                      <span className="text-sm font-medium text-zinc-300">Interests</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.split(',').map((interest: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center mx-auto mb-4 border border-zinc-800 border-dashed">
                <UserCircle size={32} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">Profile information unavailable</p>
            </div>
          )}
        </div>
      ) : (
        /* Shared Media View */
        <div className="flex-1 overflow-hidden">
          {conversationId && authToken && (
            <SharedMediaView conversationId={conversationId} authToken={authToken} />
          )}
        </div>
      )}
    </div>
  );
}

import { ArrowLeft, Search, Award, MessageSquare, Users } from 'lucide-react';
import ImageStack from '@/components/messages/ImageStack';

interface CommunityTabProps {
  communitySubTab: 'teachers' | 'groups';
  setCommunitySubTab: (tab: 'teachers' | 'groups') => void;
  changeTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupSearchQuery: string;
  setGroupSearchQuery: (query: string) => void;
  loadTeachers: (query?: string) => Promise<void>;
  loadGroups: (query?: string) => Promise<void>;
  teachersLoading: boolean;
  teachers: any[];
  user: any;
  followingTeachers: Set<string>;
  toggleFollowTeacher: (teacherId: string) => Promise<void>;
  startMessagingWithTeacher: (userId: string) => void;
  groupsLoading: boolean;
  groups: any[];
  handleJoinGroup: (groupId: string, isPublic: boolean) => Promise<void>;
}

export default function CommunityTab({
  communitySubTab,
  setCommunitySubTab,
  changeTab,
  searchQuery,
  setSearchQuery,
  groupSearchQuery,
  setGroupSearchQuery,
  loadTeachers,
  loadGroups,
  teachersLoading,
  teachers,
  user,
  followingTeachers,
  toggleFollowTeacher,
  startMessagingWithTeacher,
  groupsLoading,
  groups,
  handleJoinGroup,
}: CommunityTabProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => changeTab('Overview')}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-xl font-semibold">
            {communitySubTab === 'teachers' ? 'Discover Teachers' : 'Discover Groups'}
          </h3>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 border-b border-neutral-800">
        <button
          onClick={() => setCommunitySubTab('teachers')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${communitySubTab === 'teachers'
            ? 'border-white text-white'
            : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Teachers
        </button>
        <button
          onClick={() => setCommunitySubTab('groups')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${communitySubTab === 'groups'
            ? 'border-white text-white'
            : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
        >
          Groups
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 sm:mb-6">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder={communitySubTab === 'teachers' ? "Search by name or specialization..." : "Search groups..."}
          value={communitySubTab === 'teachers' ? searchQuery : groupSearchQuery}
          onChange={(e) => {
            if (communitySubTab === 'teachers') {
              setSearchQuery(e.target.value);
              loadTeachers(e.target.value || undefined);
            } else {
              setGroupSearchQuery(e.target.value);
              loadGroups(e.target.value || undefined);
            }
          }}
          className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
        />
      </div>

      {/* Teachers List */}
      {communitySubTab === 'teachers' && (
        <>
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

                        {/* Action Buttons */}
                        <div className="ml-2 sm:ml-4 flex-shrink-0 flex items-center gap-2">
                          {!isOwnProfile ? (
                            <>
                              {/* Message Button - Only show if following */}
                              {isFollowing && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startMessagingWithTeacher(teacher.userId);
                                  }}
                                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors relative z-10 cursor-pointer"
                                  style={{ pointerEvents: 'auto' }}
                                  title="Send message"
                                >
                                  <MessageSquare size={18} className="text-white" />
                                </button>
                              )}
                              {/* Follow Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFollowTeacher(teacher.id);
                                }}
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded text-xs font-medium transition-colors whitespace-nowrap relative z-10 cursor-pointer ${isFollowing
                                  ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                                  : 'bg-white text-black hover:bg-neutral-200'
                                  }`}
                                style={{ pointerEvents: 'auto' }}
                              >
                                {isFollowing ? 'Following' : 'Follow'}
                              </button>
                            </>
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

      {/* Groups List */}
      {communitySubTab === 'groups' && (
        <>
          {groupsLoading ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">Loading groups...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group: any) => (
                <div
                  key={group.id}
                  className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Group Avatar */}
                    <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden">
                      {group.avatarUrl ? (
                        <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        group.name.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-white mb-1 truncate">{group.name}</h4>
                          <p className="text-xs text-neutral-500">
                            Created by {group.creator.displayName}
                          </p>
                        </div>

                        {/* Join Button */}
                        <div className="flex-shrink-0">
                          {group.isMember ? (
                            <span className="px-4 py-2 bg-neutral-800 text-white text-xs font-medium rounded-lg border border-neutral-700">
                              Member
                            </span>
                          ) : group.hasRequestedJoin ? (
                            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-lg border border-yellow-500/30">
                              Requested
                            </span>
                          ) : (
                            <button
                              onClick={() => handleJoinGroup(group.id, group.isPublic)}
                              className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                            >
                              {group.isPublic ? 'Join' : 'Request'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {group.description && (
                        <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                          {group.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <div className="flex items-center">
                          <ImageStack
                            images={group.creator?.avatarUrl ? [group.creator.avatarUrl] : []}
                            totalCount={group.memberCount}
                            limit={4}
                            size={30}
                          />
                        </div>
                        {!group.isPublic && (
                          <span className="px-2 py-1 bg-neutral-800 rounded-full">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-neutral-700" />
              <p className="text-neutral-500">
                {groupSearchQuery ? 'No groups found matching your search' : 'No groups available yet'}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

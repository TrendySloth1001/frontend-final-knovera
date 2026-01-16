'use client';

import { X, Edit2, UserPlus, UserMinus, Search, Crown, MoreHorizontal, MoreVertical, Camera, Settings, Link as LinkIcon, UserCheck, Pin, Megaphone, BarChart3, Shield, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatConversation, GroupMember } from '@/types/chat';
import { useState, useRef, useEffect } from 'react';
import { updateMemberRole } from '@/lib/groupManagementApi';
import ImageStack from './ImageStack';
import CreatePollModal from '../group/CreatePollModal';
import CreateAnnouncementModal from '../group/CreateAnnouncementModal';
import SharedMediaView from './SharedMediaView';

interface GroupMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupConversation: ChatConversation | null;
  currentUserId: string;
  authToken: string;
  onUpdateGroupName?: (conversationId: string, newName: string) => Promise<void>;
  onUpdateGroupAvatar?: (conversationId: string, file: File) => Promise<void>;
  onRemoveMember?: (conversationId: string, userId: string) => Promise<void>;
  onAddMembers?: (conversationId: string) => void;
  onLeaveGroup?: (conversationId: string) => Promise<void>;
  // Group Management
  onGroupSettings?: () => void;
  onMemberList?: () => void;
  onInviteLinks?: () => void;
  onJoinRequests?: () => void;
  onPinnedMessages?: () => void;
}

export default function GroupMembersDrawer({
  isOpen,
  onClose,
  selectedGroupConversation,
  currentUserId,
  authToken,
  onUpdateGroupName,
  onUpdateGroupAvatar,
  onRemoveMember,
  onAddMembers,
  onLeaveGroup,
  onGroupSettings,
  onMemberList,
  onInviteLinks,
  onJoinRequests,
  onPinnedMessages,
}: GroupMembersDrawerProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [activeMemberMenu, setActiveMemberMenu] = useState<string | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [isAdminControlsOpen, setIsAdminControlsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'media'>('overview');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMemberMenu && !target.closest('.member-menu-container')) {
        setActiveMemberMenu(null);
      }
    };

    if (activeMemberMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMemberMenu]);

  if (!isOpen || !selectedGroupConversation) return null;

  const isCreator = selectedGroupConversation.createdBy === currentUserId;

  // Check if current user is admin or moderator
  const currentMember = selectedGroupConversation.members.find(m => m.userId === currentUserId);
  const isAdmin = currentMember?.role === 'admin';
  const isModerator = currentMember?.role === 'moderator';
  const canManage = isAdmin || isModerator || isCreator; // Explicitly include creator

  // ... (keeping existing handlers handleUpdateName, handleAvatarChange, handleRemoveMember)
  const handleUpdateName = async () => {
    if (!editedName.trim() || !onUpdateGroupName) return;

    setIsUpdating(true);
    try {
      await onUpdateGroupName(selectedGroupConversation.id, editedName.trim());
      setIsEditingName(false);
      setEditedName('');
    } catch (error) {
      console.error('Failed to update group name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateGroupAvatar) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateGroupAvatar(selectedGroupConversation.id, file);
    } catch (error) {
      console.error('Failed to update group avatar:', error);
      alert('Failed to update group avatar');
    } finally {
      setIsUpdating(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!onRemoveMember) return;

    const confirmed = window.confirm('Are you sure you want to remove this member?');
    if (!confirmed) return;

    try {
      await onRemoveMember(selectedGroupConversation.id, userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };


  const filteredMembers = selectedGroupConversation.members.filter(member =>
    member.user.displayName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (member.user.username && member.user.username.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-[400px] bg-[#0a0a0a] border-l border-zinc-800 z-50 flex flex-col shadow-2xl transition-transform duration-300">

        {/* Header Section */}
        <div className="px-6 py-5 border-b border-zinc-800/50 bg-[#0a0a0a] shrink-0">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-zinc-400 font-medium text-sm uppercase tracking-widest">Group Info</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center">
            {/* Group Avatar with Upload Option */}
            <div className="relative group/avatar mb-4">
              <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-400 overflow-hidden">
                {selectedGroupConversation.avatarUrl ? (
                  <img
                    src={selectedGroupConversation.avatarUrl}
                    alt={selectedGroupConversation.name || 'Group'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedGroupConversation.name ? selectedGroupConversation.name.substring(0, 1).toUpperCase() : 'G'
                )}
              </div>

              {/* Camera overlay for creator */}
              {isCreator && onUpdateGroupAvatar && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUpdating}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-3xl disabled:opacity-50"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                </>
              )}
            </div>

            {isEditingName ? (
              <div className="flex gap-2 w-full max-w-xs animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder={selectedGroupConversation.name || 'Group name'}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') {
                      setIsEditingName(false);
                      setEditedName('');
                    }
                  }}
                />
                <button
                  onClick={handleUpdateName}
                  disabled={!editedName.trim() || isUpdating}
                  className="px-4 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group relative">
                <h1 className="text-xl font-bold text-white text-center">
                  {selectedGroupConversation.name || 'Unnamed Group'}
                </h1>
                {isCreator && onUpdateGroupName && (
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setEditedName(selectedGroupConversation.name || '');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded-lg transition-all absolute -right-8 top-1/2 -translate-y-1/2"
                  >
                    <Edit2 size={14} className="text-zinc-400" />
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-2 mt-2">
              <ImageStack
                images={selectedGroupConversation.members.map(m => m.user.avatarUrl || `https://ui-avatars.com/api/?name=${m.user.displayName}`)}
                size={32}
                limit={5}
              />
              <p className="text-zinc-500 text-sm">
                {selectedGroupConversation.members.filter(m => m.user.isOnline).length} online
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'media' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Shared Media
            {activeTab === 'media' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          {activeTab === 'overview' ? (
            <div className="px-6 py-4 border-b border-zinc-800/30">
              {/* Search Members */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search specific member..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              {isCreator && onAddMembers && (
                <button
                  onClick={() => {
                    onAddMembers(selectedGroupConversation.id);
                    onClose();
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-400 text-sm font-medium hover:bg-zinc-900/50 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  <span>Add New Member</span>
                </button>
              )}

              {/* Group Management Actions */}
              <div className="mt-4 space-y-2">
                {/* All Members Can View */}
                <button
                  onClick={() => {
                    onPinnedMessages?.();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                >
                  <Pin size={16} className="text-blue-400" />
                  <span className="flex-1 text-left">Pinned Messages</span>
                </button>

                <button
                  onClick={() => {
                    setShowPollModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                >
                  <BarChart3 size={16} className="text-cyan-400" />
                  <span className="flex-1 text-left">Create Poll</span>
                </button>

                {/* Admin/Moderator Only */}
                {canManage && (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
                    <button
                      onClick={() => setIsAdminControlsOpen(!isAdminControlsOpen)}
                      className="w-full px-4 py-3 bg-zinc-900/50 flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider hover:bg-zinc-900 transition-colors"
                    >
                      <span>Admin Controls</span>
                      {isAdminControlsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isAdminControlsOpen && (
                      <div className="p-2 space-y-2 border-t border-zinc-800/50">
                        {(isAdmin || isModerator || isCreator) && (
                          <button
                            onClick={() => setShowAnnouncementModal(true)}
                            className="w-full py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                          >
                            <Megaphone size={16} className="text-pink-400" />
                            <span className="flex-1 text-left">Make Announcement</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onGroupSettings?.();
                            onClose();
                          }}
                          className="w-full py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                        >
                          <Settings size={16} className="text-purple-400" />
                          <span className="flex-1 text-left">Group Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            onInviteLinks?.();
                            onClose();
                          }}
                          className="w-full py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                        >
                          <LinkIcon size={16} className="text-green-400" />
                          <span className="flex-1 text-left">Invite Links</span>
                        </button>

                        <button
                          onClick={() => {
                            onJoinRequests?.();
                            onClose();
                          }}
                          className="w-full py-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 px-4"
                        >
                          <UserPlus size={16} className="text-yellow-400" />
                          <span className="flex-1 text-left">Join Requests</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isCreator && onLeaveGroup && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to leave this group?')) {
                      onLeaveGroup(selectedGroupConversation.id);
                    }
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <UserMinus size={16} />
                  <span>Leave Group</span>
                </button>
              )}

              <div className="p-4 space-y-1">
                {filteredMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900/40 transition-colors border border-transparent hover:border-zinc-800/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                          {member.user.avatarUrl ? (
                            <img src={member.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-500">
                              {member.user.displayName ? member.user.displayName.substring(0, 2).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        {member.user.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-zinc-200 truncate">{member.user.displayName}</span>
                          {member.userId === selectedGroupConversation.createdBy ? (
                            <span title="Owner"><Crown size={14} className="text-amber-500 fill-amber-500" /></span>
                          ) : member.role === 'admin' ? (
                            <span title="Admin"><Shield size={14} className="text-rose-500 fill-rose-500" /></span>
                          ) : member.role === 'moderator' ? (
                            <span title="Moderator"><ShieldCheck size={14} className="text-indigo-400" /></span>
                          ) : null}
                        </div>
                        <span className="text-xs text-zinc-600 truncate">
                          {member.user.username ? `@${member.user.username}` : 'No username'}
                        </span>
                      </div>
                    </div>

                    {canManage && member.userId !== currentUserId ? (
                      <div className="relative shrink-0 member-menu-container">
                        <button
                          onClick={() => setActiveMemberMenu(activeMemberMenu === member.userId ? null : member.userId)}
                          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                          title="Member options"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMemberMenu === member.userId && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 py-1">
                            {(isAdmin || isCreator) && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateMemberRole(selectedGroupConversation.id, member.userId, 'admin');
                                      setActiveMemberMenu(null);
                                      alert('Role updated. Please refresh to see changes.');
                                    } catch (e) {
                                      alert('Failed to update role');
                                    }
                                  }}
                                  disabled={member.role === 'admin'}
                                  className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Crown size={14} className="text-yellow-400" />
                                  <span>Make Admin</span>
                                </button>

                                <button
                                  onClick={async () => {
                                    try {
                                      await updateMemberRole(selectedGroupConversation.id, member.userId, 'moderator');
                                      setActiveMemberMenu(null);
                                      alert('Role updated. Please refresh to see changes.');
                                    } catch (e) {
                                      alert('Failed to update role');
                                    }
                                  }}
                                  disabled={member.role === 'moderator'}
                                  className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Settings size={14} className="text-purple-400" />
                                  <span>Make Moderator</span>
                                </button>

                                {(member.role === 'admin' || member.role === 'moderator') && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await updateMemberRole(selectedGroupConversation.id, member.userId, 'member');
                                        setActiveMemberMenu(null);
                                        alert('Role updated. Please refresh to see changes.');
                                      } catch (e) {
                                        alert('Failed to update role');
                                      }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                  >
                                    <UserCheck size={14} className="text-zinc-400" />
                                    <span>Dismiss as Admin</span>
                                  </button>
                                )}
                                <div className="h-px bg-zinc-800 my-1" />
                              </>
                            )}

                            {/* ... (keeping existing menu options) */}

                            {onRemoveMember && (
                              <button
                                onClick={() => {
                                  handleRemoveMember(member.userId);
                                  setActiveMemberMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                              >
                                <UserMinus size={14} />
                                <span>Kick Member</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                onMemberList?.();
                                setActiveMemberMenu(null);
                                onClose();
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                            >
                              <X size={14} />
                              <span>Ban Member</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    No members found
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SharedMediaView conversationId={selectedGroupConversation.id} authToken={authToken} />
          )}
        </div>
      </div>

      {/* Poll Creation Modal */}
      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        conversationId={selectedGroupConversation.id}
        currentUserId={currentUserId}
        onPollCreated={() => {
          setShowPollModal(false);
          // Optionally refresh or notify
        }}
      />

      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        conversationId={selectedGroupConversation.id}
        onSuccess={() => {
          // Announcement sent
          setShowAnnouncementModal(false);
          onClose(); // Close drawer to show banner?
        }}
      />
    </>
  );
}

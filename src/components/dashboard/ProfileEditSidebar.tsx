/**
 * Profile Edit Sidebar
 * Overlay sidebar for editing user profile information
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { profileAPI } from '@/lib/api';

interface ProfileEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'TEACHER' | 'STUDENT';
  profileId: string;
  currentProfile: any;
  onProfileUpdated: () => void;
}

export default function ProfileEditSidebar({
  isOpen,
  onClose,
  userRole,
  profileId,
  currentProfile,
  onProfileUpdated,
}: ProfileEditSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Teacher fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState<number | ''>('');

  // Student fields
  const [grade, setGrade] = useState('');
  const [institution, setInstitution] = useState('');
  const [interests, setInterests] = useState('');

  // Initialize form with current profile data
  useEffect(() => {
    if (currentProfile && isOpen) {
      setFirstName(currentProfile.firstName || '');
      setLastName(currentProfile.lastName || '');
      
      if (userRole === 'TEACHER') {
        setBio(currentProfile.bio || '');
        setSpecialization(currentProfile.specialization || '');
        setQualification(currentProfile.qualification || '');
        setExperience(currentProfile.experience || '');
      } else {
        setGrade(currentProfile.grade || '');
        setInstitution(currentProfile.institution || '');
        setInterests(currentProfile.interests || '');
      }
    }
  }, [currentProfile, isOpen, userRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (userRole === 'TEACHER') {
        await profileAPI.updateTeacher(profileId, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim() || undefined,
          specialization: specialization.trim() || undefined,
          qualification: qualification.trim() || undefined,
          experience: experience === '' ? undefined : Number(experience),
        });
      } else {
        await profileAPI.updateStudent(profileId, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          grade: grade.trim() || undefined,
          institution: institution.trim() || undefined,
          interests: interests.trim() || undefined,
        });
      }

      setSuccess(true);
      onProfileUpdated();
      
      // Close after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-black border-l border-neutral-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-neutral-800 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-sm text-green-400">Profile updated successfully!</p>
            </div>
          )}

          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
          </div>

          {/* Teacher-specific Fields */}
          {userRole === 'TEACHER' && (
            <div className="space-y-4 border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-white mb-4">Professional Information</h3>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Qualification</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., M.Sc., Ph.D."
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="Years of teaching experience"
                />
              </div>
            </div>
          )}

          {/* Student-specific Fields */}
          {userRole === 'STUDENT' && (
            <div className="space-y-4 border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-white mb-4">Academic Information</h3>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Grade</label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., 10, 12, Undergraduate"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="Your school/college name"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">Interests</label>
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-white transition-colors resize-none"
                  placeholder="Subjects you're interested in (comma-separated)"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-800 text-white rounded-lg hover:bg-neutral-900 transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

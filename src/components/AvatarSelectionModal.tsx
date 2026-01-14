/**
 * Avatar Selection Modal
 * Component for selecting or uploading user avatar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';
import { avatarAPI, PredefinedAvatar } from '@/lib/avatar-api';
import { getAuthToken } from '@/lib/api';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onAvatarUpdated: (newAvatarUrl: string | null) => void;
}

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onAvatarUpdated,
}: AvatarSelectionModalProps) {
  const [predefinedAvatars, setPredefinedAvatars] = useState<PredefinedAvatar[]>([]);
  const [userAvatars, setUserAvatars] = useState<PredefinedAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadPredefinedAvatars();
      loadUserAvatars();
      setSelectedAvatar(currentAvatarUrl || null);
    }
  }, [isOpen, currentAvatarUrl]);

  const loadPredefinedAvatars = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      console.log('[AvatarModal] Token exists:', !!token);
      if (!token) {
        console.warn('[AvatarModal] No authentication token found');
        return;
      }

      console.log('[AvatarModal] Fetching predefined avatars...');
      const avatars = await avatarAPI.getPredefinedAvatars(token);
      console.log('[AvatarModal] Received avatars:', avatars);
      console.log('[AvatarModal] Avatar count:', avatars.length);
      setPredefinedAvatars(avatars);
    } catch (err) {
      console.error('[AvatarModal] Failed to load avatars:', err);
      setError('Failed to load predefined avatars');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserAvatars = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      console.log('[AvatarModal] Fetching user avatars...');
      const avatars = await avatarAPI.getUserAvatars(token);
      console.log('[AvatarModal] Received user avatars:', avatars);
      setUserAvatars(avatars);
    } catch (err) {
      console.error('[AvatarModal] Failed to load user avatars:', err);
      // Don't show error for user avatars, just log it
    }
  };

  const handleSelectAvatar = async (avatarUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) return;

      await avatarAPI.setAvatar(token, avatarUrl);
      setSelectedAvatar(avatarUrl);
      onAvatarUpdated(avatarUrl);
      onClose();
    } catch (err) {
      console.error('Failed to set avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to set avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) return;

      const result = await avatarAPI.uploadCustomAvatar(token, file);
      setSelectedAvatar(result.avatarUrl);
      
      // Reload user avatars to show the newly uploaded one
      await loadUserAvatars();
      
      onAvatarUpdated(result.avatarUrl);
      onClose();
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) return;

      await avatarAPI.removeAvatar(token);
      setSelectedAvatar(null);
      onAvatarUpdated(null);
      onClose();
    } catch (err) {
      console.error('Failed to remove avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">Choose Your Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Upload Custom */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Upload Custom Avatar</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-4 border-2 border-dashed border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Click to upload image (max 5MB)</span>
                </>
              )}
            </button>
          </div>

          {/* User's Custom Avatars */}
          {userAvatars.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">My Uploaded Avatars</h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {userAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar.url)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar.url
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                    title={avatar.filename}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666" font-size="12"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Avatars */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Available Avatars</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-zinc-500" />
              </div>
            ) : predefinedAvatars.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p>No avatars available</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {predefinedAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleSelectAvatar(avatar.url)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar.url
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                    title={avatar.filename}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666" font-size="12"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <button
            onClick={handleRemoveAvatar}
            disabled={!currentAvatarUrl || isLoading}
            className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Remove Avatar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

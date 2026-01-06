/**
 * Settings Page
 * Account settings including deactivation
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Trash2, User, Mail, Shield, Calendar } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import Notification from '@/components/Notification';
import { apiClient } from '@/lib/api';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      await apiClient.patch('/api/auth/deactivate');
      showNotification('success', 'Account deactivated successfully. Redirecting to login...');
      
      // Clear auth and redirect after a brief delay
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate account';
      showNotification('error', message);
    } finally {
      setIsDeactivating(false);
      setShowDeactivateDialog(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-2xl">
            
            {/* Profile Section */}
            <section className="mb-12">
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-6">Profile</h2>
              
              <div className="space-y-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 flex-shrink-0 shadow-lg">
                    {user.user.avatarUrl ? (
                      <img 
                        src={user.user.avatarUrl} 
                        alt={user.user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-2xl text-white font-bold">
                          {user.user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{user.user.displayName}</div>
                    <div className="text-white/60 text-sm">{user.user.role}</div>
                  </div>
                </div>

                {/* Email */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-start justify-between py-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Mail size={18} className="text-white/40 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-white/60 mb-1">Email address</div>
                        <div className="text-white">{user.user.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-start justify-between py-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield size={18} className="text-white/40 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-white/60 mb-1">Account status</div>
                        <div className="flex items-center gap-2">
                          <span className="text-white">Active</span>
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-start justify-between py-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Calendar size={18} className="text-white/40 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-white/60 mb-1">Member since</div>
                        <div className="text-white">
                          {new Date(user.user.createdAt).toLocaleDateString('en-US', { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="mb-12 pt-6 border-t border-red-500/20">
              <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <AlertTriangle size={14} />
                Danger Zone
              </h2>
              
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">Deactivate account</div>
                    <p className="text-white/60 text-sm">
                      Permanently deactivate your account. This cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeactivateDialog(true)}
                    disabled={isDeactivating}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 rounded-lg transition-colors flex-shrink-0 text-sm font-medium border border-red-500/20 hover:border-red-500/30"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your account? This action cannot be reversed and you will lose access to all your content and progress."
        confirmText={isDeactivating ? "Deactivating..." : "Deactivate"}
        cancelText="Cancel"
        onConfirm={handleDeactivateAccount}
        onCancel={() => setShowDeactivateDialog(false)}
        variant="danger"
      />

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm pointer-events-auto">
        {notifications.map(notif => (
          <Notification
            key={notif.id}
            id={notif.id}
            type={notif.type}
            message={notif.message}
            onClose={removeNotification}
            duration={4000}
          />
        ))}
      </div>
    </div>
  );
}
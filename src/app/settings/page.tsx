/**
 * Settings Page
 * Unified settings with sidebar navigation (chat-style)
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, AlertTriangle, Sparkles, ChevronRight, Settings as SettingsIcon,
  User, Palette, MessageSquare, Hash, AlignLeft, Save, RotateCcw, Menu, X,
  Shield, Bell, Trash2, Plus
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import Notification from '@/components/Notification';
import { apiClient, getAuthToken } from '@/lib/api';
import AvatarSelectionModal from '@/components/AvatarSelectionModal';

const API_BASE_URL = 'http://localhost:3001';

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

const INSTRUCTION_SUGGESTIONS = [
  'Be concise and to the point',
  'Use simple language',
  'Provide examples',
  'Focus on practical applications',
  'Explain like I\'m a beginner',
  'Use analogies',
  'Break down complex topics',
  'Ask clarifying questions',
  'Suggest additional resources',
  'Use step-by-step explanations',
  'Include code examples',
  'Provide real-world scenarios',
  'Challenge me with questions',
  'Review key concepts',
  'Connect to previous learning',
];

type SettingsSection = 'account' | 'ai-preferences';

interface AISettings {
  baseTone: string;
  warmth: number;
  enthusiasm: number;
  emojiUsage: string;
  useHeaders: boolean;
  responseLength: string;
  customInstructions: string | null;
  profileEnabled: boolean;
}

interface UserContext {
  learningGoals: string | null;
  weakSubjects: string[];
  strongSubjects: string[];
  preferredExamples: string | null;
  interests: string | null;
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string }>>([]);
  
  // AI Settings state
  const [aiSettings, setAiSettings] = useState<AISettings>({
    baseTone: 'friendly',
    warmth: 7,
    enthusiasm: 7,
    emojiUsage: 'occasional',
    useHeaders: true,
    responseLength: 'balanced',
    customInstructions: null,
    profileEnabled: false,
  });
  
  const [userContext, setUserContext] = useState<UserContext>({
    learningGoals: null,
    weakSubjects: [],
    strongSubjects: [],
    preferredExamples: null,
    interests: null,
  });
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load AI settings when AI Preferences section is active
  useEffect(() => {
    if (user && activeSection === 'ai-preferences') {
      loadAISettings();
    }
  }, [user, activeSection]);

  const loadAISettings = async () => {
    if (!user) return;
    
    try {
      setIsLoadingSettings(true);
      const token = getAuthToken();
      
      if (!token) return;

      const [settingsRes, contextRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/${user.user.id}/ai-settings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/users/${user.user.id}/context`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (settingsRes.ok) {
        const result = await settingsRes.json();
        if (result.success && result.data) {
          setAiSettings(result.data);
        }
      }

      if (contextRes.ok) {
        const result = await contextRes.json();
        if (result.success && result.data) {
          setUserContext(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveAISettings = async () => {
    if (!user) return;
    
    try {
      setIsSavingSettings(true);
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'No authentication token found. Please log in again.');
        router.push('/login');
        return;
      }

      const settingsRes = await fetch(`${API_BASE_URL}/api/users/${user.user.id}/ai-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiSettings),
      });

      if (aiSettings.profileEnabled) {
        await fetch(`${API_BASE_URL}/api/users/${user.user.id}/context`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userContext),
        });
      }

      if (settingsRes.ok) {
        showNotification('success', 'Settings saved successfully!');
      } else {
        showNotification('error', 'Failed to save settings');
      }
    } catch (error) {
      showNotification('error', 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetAISettings = async () => {
    if (!user) return;
    
    try {
      setIsSavingSettings(true);
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'No authentication token found. Please log in again.');
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/${user.user.id}/ai-settings/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setAiSettings(result.data);
        }
        showNotification('success', 'Settings reset to defaults');
      }
    } catch (error) {
      showNotification('error', 'Failed to reset settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

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
      showNotification('success', 'Account deactivated successfully');
      
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

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    showNotification('success', 'Avatar updated successfully');
    // Refresh the page to update user data
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const settingsSections = [
    { id: 'account' as SettingsSection, icon: User, label: 'Account', description: 'Manage your account' },
    { id: 'ai-preferences' as SettingsSection, icon: Sparkles, label: 'AI Preferences', description: 'Customize AI behavior' },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar - Chat style */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarOpen ? 'md:w-64' : 'w-0 md:w-0'}
        fixed md:relative z-30 h-full w-64
        transition-all duration-300 
        border-r border-white/10 bg-black
        flex flex-col overflow-hidden
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} />
            <h2 className="font-semibold text-lg">Settings</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Options */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left
                    ${activeSection === section.id 
                      ? 'bg-white/10 border border-white/20' 
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon size={18} className={activeSection === section.id ? 'text-white' : 'text-white/60'} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${activeSection === section.id ? 'text-white' : 'text-white/80'}`}>
                      {section.label}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {section.description}
                    </div>
                  </div>
                  {activeSection === section.id && (
                    <div className="w-1.5 h-8 bg-purple-500 rounded-full -mr-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer - Back to Chat */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => router.push('/chat/new')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-black hover:bg-white/5 border border-white/20 rounded-lg transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Chat</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-14 md:h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                {settingsSections.find(s => s.id === activeSection)?.label}
              </h1>
              <p className="text-xs text-white/40 hidden sm:block">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
          </div>

          {/* Action Buttons for AI Preferences - Desktop Only */}
          {activeSection === 'ai-preferences' && (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleResetAISettings}
                disabled={isSavingSettings}
                className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 border border-white/10 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleSaveAISettings}
                disabled={isSavingSettings}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {isSavingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-3 md:p-6">
            {/* Mobile Action Buttons for AI Preferences */}
            {activeSection === 'ai-preferences' && (
              <div className="md:hidden flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <button
                  onClick={handleResetAISettings}
                  disabled={isSavingSettings}
                  className="flex-1 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleSaveAISettings}
                  disabled={isSavingSettings}
                  className="flex-1 px-4 py-2.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSavingSettings ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}

            {activeSection === 'account' && (
              <AccountSettings
                user={user}
                onDeactivate={() => setShowDeactivateDialog(true)}
                onEditAvatar={() => setShowAvatarModal(true)}
              />
            )}

            {activeSection === 'ai-preferences' && (
              <AIPreferencesSettings
                aiSettings={aiSettings}
                setAiSettings={setAiSettings}
                userContext={userContext}
                setUserContext={setUserContext}
                isLoading={isLoadingSettings}
              />
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            id={notif.id}
            type={notif.type}
            message={notif.message}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>

      {/* Deactivate Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onCancel={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivateAccount}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your account? You can reactivate it by logging in again."
        confirmText="Deactivate"
        variant="danger"
      />

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <AvatarSelectionModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          currentAvatarUrl={user?.user.avatarUrl}
          onAvatarUpdated={handleAvatarUpdated}
        />
      )}
    </div>
  );
}

// Account Settings Component
function AccountSettings({ user, onDeactivate, onEditAvatar }: any) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Card */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
          <User size={18} className="md:w-5 md:h-5" />
          Profile Information
        </h3>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/20">
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
            <button
              onClick={onEditAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change avatar"
            >
              <User size={20} className="text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg md:text-xl font-semibold truncate">{user.user.displayName}</div>
            <div className="text-xs md:text-sm text-white/60 truncate">{user.user.email}</div>
            <div className="mt-1.5 md:mt-2 inline-block px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium bg-purple-500/20 border border-purple-500/30 text-purple-200">
              {user.user.role}
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
          <Shield size={20} />
          Account Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={onDeactivate}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-red-400" />
              <div className="text-left">
                <div className="font-medium text-red-200">Deactivate Account</div>
                <div className="text-xs text-red-300/60">Temporarily disable your account</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Preferences Settings Component
function AIPreferencesSettings({ aiSettings, setAiSettings, userContext, setUserContext, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading AI preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Personality Section */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
          <Sparkles size={18} className="md:w-5 md:h-5 text-purple-400" />
          AI Personality
        </h3>

        <div className="space-y-4 md:space-y-6">
          {/* Base Tone */}
          <div>
            <label className="block text-sm font-medium mb-2 md:mb-3">Base Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {['friendly', 'professional', 'casual', 'enthusiastic'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setAiSettings({ ...aiSettings, baseTone: tone })}
                  className={`px-4 py-2.5 rounded-lg border transition-all text-sm font-medium capitalize ${
                    aiSettings.baseTone === tone
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                      : 'border-white/20 hover:border-white/30 text-white/60'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Warmth Slider */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Warmth <span className="text-white/40">({aiSettings.warmth}/10)</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={aiSettings.warmth}
              onChange={(e) => setAiSettings({ ...aiSettings, warmth: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>Reserved</span>
              <span>Very Warm</span>
            </div>
          </div>

          {/* Enthusiasm Slider */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Enthusiasm <span className="text-white/40">({aiSettings.enthusiasm}/10)</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={aiSettings.enthusiasm}
              onChange={(e) => setAiSettings({ ...aiSettings, enthusiasm: parseInt(e.target.value) })}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>Calm</span>
              <span>Very Enthusiastic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Formatting */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 flex items-center gap-2">
          <AlignLeft size={20} />
          Response Formatting
        </h3>

        <div className="space-y-6">
          {/* Response Length */}
          <div>
            <label className="block text-sm font-medium mb-3">Response Length</label>
            <div className="grid grid-cols-3 gap-2">
              {['concise', 'balanced', 'detailed'].map((length) => (
                <button
                  key={length}
                  onClick={() => setAiSettings({ ...aiSettings, responseLength: length })}
                  className={`px-4 py-2.5 rounded-lg border transition-all text-sm font-medium capitalize ${
                    aiSettings.responseLength === length
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                      : 'border-white/20 hover:border-white/30 text-white/60'
                  }`}
                >
                  {length}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji Usage */}
          <div>
            <label className="block text-sm font-medium mb-3">Emoji Usage</label>
            <div className="grid grid-cols-4 gap-2">
              {['none', 'minimal', 'occasional', 'frequent'].map((usage) => (
                <button
                  key={usage}
                  onClick={() => setAiSettings({ ...aiSettings, emojiUsage: usage })}
                  className={`px-3 py-2.5 rounded-lg border transition-all text-xs font-medium capitalize ${
                    aiSettings.emojiUsage === usage
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                      : 'border-white/20 hover:border-white/30 text-white/60'
                  }`}
                >
                  {usage}
                </button>
              ))}
            </div>
          </div>

          {/* Use Headers Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <div className="font-medium">Use Headers</div>
              <div className="text-sm text-white/60">Structure responses with markdown headers</div>
            </div>
            <button
              onClick={() => setAiSettings({ ...aiSettings, useHeaders: !aiSettings.useHeaders })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                aiSettings.useHeaders ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                aiSettings.useHeaders ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Custom Instructions
        </h3>
        
        {/* Suggestion Tags */}
        <div className="mb-4">
          <p className="text-sm text-white/60 mb-3">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {INSTRUCTION_SUGGESTIONS.map((suggestion, index) => {
              const colorClass = TAG_COLORS[index % TAG_COLORS.length];
              const currentInstructions = aiSettings.customInstructions || '';
              const isAdded = currentInstructions.includes(suggestion);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (isAdded) {
                      // Remove the suggestion
                      const newInstructions = currentInstructions
                        .replace(suggestion + '. ', '')
                        .replace(suggestion, '')
                        .replace(/\.\s*\./, '.')
                        .trim();
                      setAiSettings({ ...aiSettings, customInstructions: newInstructions });
                    } else {
                      // Add the suggestion
                      const newInstructions = currentInstructions 
                        ? `${currentInstructions.trim()}. ${suggestion}`
                        : suggestion;
                      setAiSettings({ ...aiSettings, customInstructions: newInstructions });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    isAdded 
                      ? colorClass + ' opacity-100' 
                      : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
                  }`}
                >
                  {isAdded && <span className="mr-1">✓</span>}
                  {suggestion}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom textarea */}
        <textarea
          value={aiSettings.customInstructions || ''}
          onChange={(e) => setAiSettings({ ...aiSettings, customInstructions: e.target.value })}
          placeholder="Or write your own custom instructions..."
          className="w-full h-32 bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
        />
      </div>

      {/* User Context Section */}
      <div className="bg-black border border-white/10 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User size={20} />
            About You (Context)
          </h3>
          <button
            onClick={() => setAiSettings({ ...aiSettings, profileEnabled: !aiSettings.profileEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              aiSettings.profileEnabled ? 'bg-purple-500' : 'bg-white/20'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              aiSettings.profileEnabled ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {aiSettings.profileEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Learning Goals</label>
              <textarea
                value={userContext.learningGoals || ''}
                onChange={(e) => setUserContext({ ...userContext, learningGoals: e.target.value })}
                placeholder="What are you trying to learn or achieve?"
                className="w-full h-24 bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interests</label>
              <textarea
                value={userContext.interests || ''}
                onChange={(e) => setUserContext({ ...userContext, interests: e.target.value })}
                placeholder="Your interests and hobbies..."
                className="w-full h-20 bg-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

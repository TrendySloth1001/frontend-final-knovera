'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Save, RotateCcw, MessageSquare, Hash, AlignLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

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

export default function AIPreferencesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<AISettings>({
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }
    
    if (!user) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, [user, authLoading, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found. Please log in again.' });
        router.push('/login');
        return;
      }

      const settingsRes = await fetch(`${API_BASE_URL}/api/users/${user?.user.id}/ai-settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (settingsRes.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (settingsRes.ok) {
        const result = await settingsRes.json();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      }

      const contextRes = await fetch(`${API_BASE_URL}/api/users/${user?.user.id}/context`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (contextRes.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (contextRes.ok) {
        const result = await contextRes.json();
        if (result.success && result.data) {
          setUserContext(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings. Make sure the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found. Please log in again.' });
        router.push('/login');
        return;
      }

      const settingsRes = await fetch(`${API_BASE_URL}/api/users/${user?.user.id}/ai-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (settingsRes.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (settings.profileEnabled) {
        const contextRes = await fetch(`${API_BASE_URL}/api/users/${user?.user.id}/context`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userContext),
        });

        if (contextRes.status === 401) {
          setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
      }

      if (settingsRes.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await settingsRes.json();
        setMessage({ type: 'error', text: errorData.error?.message || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found. Please log in again.' });
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/${user?.user.id}/ai-settings/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.status === 401) {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setSettings(result.data);
        }
        setMessage({ type: 'success', text: 'Settings reset to defaults' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await res.json();
        setMessage({ type: 'error', text: errorData.error?.message || 'Failed to reset settings' });
      }
    } catch (error) {
      console.error('Reset error:', error);
      setMessage({ type: 'error', text: 'Failed to reset settings' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">
          {authLoading ? 'Authenticating...' : 'Loading preferences...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-purple-400" />
              <h1 className="text-xl font-semibold text-white">AI Preferences</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 border border-white/10"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className="fixed top-20 right-6 z-50">
          <div className={`px-4 py-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="max-w-3xl space-y-8">
            
            {/* Tone & Style */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Tone & Style</h2>
              </div>

              <div className="space-y-6">
                {/* Base Tone */}
                <div>
                  <label className="block text-sm text-white/60 mb-3">Base Tone</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['formal', 'friendly', 'casual', 'professional', 'encouraging'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSettings({ ...settings, baseTone: tone })}
                        className={`px-4 py-2 rounded-lg border text-sm capitalize transition-all ${
                          settings.baseTone === tone
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warmth */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-white/60">Warmth</label>
                    <span className="text-sm text-white font-medium">{settings.warmth}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={settings.warmth}
                    onChange={(e) => setSettings({ ...settings, warmth: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>Concise</span>
                    <span>Empathetic</span>
                  </div>
                </div>

                {/* Enthusiasm */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-white/60">Enthusiasm</label>
                    <span className="text-sm text-white font-medium">{settings.enthusiasm}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={settings.enthusiasm}
                    onChange={(e) => setSettings({ ...settings, enthusiasm: parseInt(e.target.value) })}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                  />
                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>Calm</span>
                    <span>Energetic</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formatting */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Hash size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Formatting</h2>
              </div>

              <div className="space-y-6">
                {/* Emoji Usage */}
                <div>
                  <label className="block text-sm text-white/60 mb-3">Emoji Usage</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'none', label: 'None', icon: '🚫' },
                      { value: 'occasional', label: 'Occasional', icon: '😊' },
                      { value: 'frequent', label: 'Frequent', icon: '🎉' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSettings({ ...settings, emojiUsage: option.value })}
                        className={`px-4 py-3 rounded-lg border text-sm transition-all ${
                          settings.emojiUsage === option.value
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Response Length */}
                <div>
                  <label className="block text-sm text-white/60 mb-3">Response Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['concise', 'balanced', 'detailed'].map((length) => (
                      <button
                        key={length}
                        onClick={() => setSettings({ ...settings, responseLength: length })}
                        className={`px-4 py-2 rounded-lg border text-sm capitalize transition-all ${
                          settings.responseLength === length
                            ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {length}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Use Headers */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <div className="text-white font-medium mb-1">Use Headers & Lists</div>
                    <div className="text-sm text-white/60">Organize responses with markdown formatting</div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, useHeaders: !settings.useHeaders })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.useHeaders ? 'bg-purple-600' : 'bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.useHeaders ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <AlignLeft size={20} className="text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Custom Instructions</h2>
              </div>

              <textarea
                value={settings.customInstructions || ''}
                onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
                placeholder="Add any specific instructions for the AI (e.g., 'Always provide real-world examples' or 'Explain concepts using analogies')"
                className="w-full h-32 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Profile Connection */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white font-medium mb-1">Connect Learning Profile</div>
                  <div className="text-sm text-white/60">Use your learning goals and preferences in AI responses</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, profileEnabled: !settings.profileEnabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.profileEnabled ? 'bg-purple-600' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.profileEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {settings.profileEnabled && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Learning Goals</label>
                    <input
                      type="text"
                      value={userContext.learningGoals || ''}
                      onChange={(e) => setUserContext({ ...userContext, learningGoals: e.target.value })}
                      placeholder="e.g., Master calculus, Improve problem-solving"
                      className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Interests</label>
                    <input
                      type="text"
                      value={userContext.interests || ''}
                      onChange={(e) => setUserContext({ ...userContext, interests: e.target.value })}
                      placeholder="e.g., Physics, Computer Science, History"
                      className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

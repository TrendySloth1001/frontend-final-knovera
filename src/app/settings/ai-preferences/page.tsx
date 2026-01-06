'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';

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
  const { user } = useAuth();
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
    if (!user) {
      router.push('/login');
      return;
    }

    loadSettings();
  }, [user, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Load AI settings
      const settingsRes = await fetch(`http://localhost:5001/api/users/${user?.id}/ai-settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          baseTone: data.baseTone,
          warmth: data.warmth,
          enthusiasm: data.enthusiasm,
          emojiUsage: data.emojiUsage,
          useHeaders: data.useHeaders,
          responseLength: data.responseLength,
          customInstructions: data.customInstructions,
          profileEnabled: data.profileEnabled,
        });
      }

      // Load user context
      const contextRes = await fetch(`http://localhost:5001/api/users/${user?.id}/context`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (contextRes.ok) {
        const data = await contextRes.json();
        setUserContext({
          learningGoals: data.learningGoals || null,
          weakSubjects: data.weakSubjects || [],
          strongSubjects: data.strongSubjects || [],
          preferredExamples: data.preferredExamples || null,
          interests: data.interests || null,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      // Save AI settings
      const settingsRes = await fetch(`http://localhost:5001/api/users/${user?.id}/ai-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!settingsRes.ok) {
        throw new Error('Failed to save AI settings');
      }

      // Save user context if profile is enabled
      if (settings.profileEnabled) {
        const contextRes = await fetch(`http://localhost:5001/api/users/${user?.id}/context`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userContext),
        });

        if (!contextRes.ok) {
          throw new Error('Failed to save user context');
        }
      }

      setMessage({ type: 'success', text: 'Settings saved successfully! ✓' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Reset all AI preferences to defaults?')) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`http://localhost:5001/api/users/${user?.id}/ai-settings/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to reset settings');

      const data = await res.json();
      setSettings({
        baseTone: data.baseTone,
        warmth: data.warmth,
        enthusiasm: data.enthusiasm,
        emojiUsage: data.emojiUsage,
        useHeaders: data.useHeaders,
        responseLength: data.responseLength,
        customInstructions: data.customInstructions,
        profileEnabled: data.profileEnabled,
      });

      setMessage({ type: 'success', text: 'Settings reset to defaults' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setMessage({ type: 'error', text: 'Failed to reset settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <TopNav />
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <TopNav />
      
      <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Preferences</h1>
          <p className="text-gray-600 mt-2">Customize how Kai interacts with you</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Base Tone */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Base Style & Tone</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversation Tone
              </label>
              <select
                value={settings.baseTone}
                onChange={(e) => setSettings({ ...settings, baseTone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="formal">Formal - Professional and academic</option>
                <option value="friendly">Friendly - Warm and approachable</option>
                <option value="casual">Casual - Relaxed like chatting with a friend</option>
                <option value="professional">Professional - Clear and precise</option>
                <option value="encouraging">Encouraging - Supportive and motivating</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warmth: {settings.warmth}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={settings.warmth}
                onChange={(e) => setSettings({ ...settings, warmth: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Concise</span>
                <span>Caring & Empathetic</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enthusiasm: {settings.enthusiasm}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={settings.enthusiasm}
                onChange={(e) => setSettings({ ...settings, enthusiasm: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Calm & Measured</span>
                <span>Excited & Energetic!</span>
              </div>
            </div>
          </div>

          {/* Characteristics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Characteristics</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoji Usage
              </label>
              <select
                value={settings.emojiUsage}
                onChange={(e) => setSettings({ ...settings, emojiUsage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">None - No emojis</option>
                <option value="occasional">Occasional - 1-2 emojis when appropriate</option>
                <option value="frequent">Frequent - 2-4 emojis for personality</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.useHeaders}
                  onChange={(e) => setSettings({ ...settings, useHeaders: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Use Headers & Lists - Organize long responses with markdown
                </span>
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Length
              </label>
              <select
                value={settings.responseLength}
                onChange={(e) => setSettings({ ...settings, responseLength: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="concise">Concise - Brief and focused (2-3 sentences)</option>
                <option value="balanced">Balanced - Thorough but focused</option>
                <option value="detailed">Detailed - Comprehensive with examples</option>
              </select>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Custom Instructions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add any specific preferences or instructions for how Kai should respond to you
            </p>
            <textarea
              value={settings.customInstructions || ''}
              onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value || null })}
              placeholder="e.g., Always explain concepts with real-world examples, avoid complex jargon..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Profile Connection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Profile</h2>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.profileEnabled}
                  onChange={(e) => setSettings({ ...settings, profileEnabled: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Enable profile connection - Let Kai remember your learning context
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                When enabled, Kai will use your learning goals and subject preferences to personalize responses
              </p>
            </div>

            {settings.profileEnabled && (
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Goals
                  </label>
                  <textarea
                    value={userContext.learningGoals || ''}
                    onChange={(e) => setUserContext({ ...userContext, learningGoals: e.target.value || null })}
                    placeholder="e.g., Master calculus for engineering entrance exams"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strong Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userContext.strongSubjects.join(', ')}
                    onChange={(e) => setUserContext({ 
                      ...userContext, 
                      strongSubjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="e.g., Physics, Chemistry"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjects Needing Help (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userContext.weakSubjects.join(', ')}
                    onChange={(e) => setUserContext({ 
                      ...userContext, 
                      weakSubjects: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                    placeholder="e.g., Mathematics, Biology"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Example Types
                  </label>
                  <input
                    type="text"
                    value={userContext.preferredExamples || ''}
                    onChange={(e) => setUserContext({ ...userContext, preferredExamples: e.target.value || null })}
                    placeholder="e.g., Real-world applications, Visual diagrams"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests & Context
                  </label>
                  <textarea
                    value={userContext.interests || ''}
                    onChange={(e) => setUserContext({ ...userContext, interests: e.target.value || null })}
                    placeholder="e.g., Interested in space exploration, loves cricket"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            <button
              onClick={resetToDefaults}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

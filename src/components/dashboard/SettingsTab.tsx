import { ArrowLeft } from 'lucide-react';

interface SettingsTabProps {
  changeTab: (tab: string) => void;
  activeSettingsTab: 'account' | 'ai' | 'profile';
  setActiveSettingsTab: (tab: 'account' | 'ai' | 'profile') => void;
  user: any;
  setShowLogoutConfirm: (show: boolean) => void;
  aiSettings: any;
  setAiSettings: (settings: any) => void;
  userContext: any;
  setUserContext: (context: any) => void;
  saveAISettings: () => Promise<void>;
  savingSettings: boolean;
  setShowProfileConfirm: (show: boolean) => void;
}

export default function SettingsTab({
  changeTab,
  activeSettingsTab,
  setActiveSettingsTab,
  user,
  setShowLogoutConfirm,
  aiSettings,
  setAiSettings,
  userContext,
  setUserContext,
  saveAISettings,
  savingSettings,
  setShowProfileConfirm,
}: SettingsTabProps) {
  return (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => changeTab('Overview')}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-semibold">Settings</h3>
      </div>

      {/* Settings Tabs */}
      <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 border-b border-neutral-800 overflow-x-auto">
        <button
          onClick={() => setActiveSettingsTab('account')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeSettingsTab === 'account'
            ? 'border-white text-white'
            : 'border-transparent text-neutral-500 hover:text-white'
            }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveSettingsTab('ai')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeSettingsTab === 'ai'
            ? 'border-white text-white'
            : 'border-transparent text-neutral-500 hover:text-white'
            }`}
        >
          AI Preferences
        </button>
        <button
          onClick={() => setActiveSettingsTab('profile')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${activeSettingsTab === 'profile'
            ? 'border-white text-white'
            : 'border-transparent text-neutral-500 hover:text-white'
            }`}
        >
          Profile
        </button>
      </div>

      {/* Account Settings */}
      {activeSettingsTab === 'account' && (
        <div className="space-y-4">
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Account Information</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 block mb-2">Display Name</label>
                <input
                  type="text"
                  value={user.user.displayName}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-2">Email</label>
                <input
                  type="email"
                  value={user.user.email}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-2">Role</label>
                <input
                  type="text"
                  value={user.user.role}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm text-white capitalize"
                />
              </div>
            </div>
          </div>

          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4 text-white">Danger Zone</h4>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-xs border border-neutral-800 text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* AI Preferences */}
      {activeSettingsTab === 'ai' && (
        <div className="space-y-4">
          {/* Tone & Style */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Tone & Style</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Base Tone</label>
                <div className="grid grid-cols-5 gap-2">
                  {['formal', 'friendly', 'casual', 'professional', 'encouraging'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAiSettings({ ...aiSettings, baseTone: tone })}
                      className={`px-3 py-2 rounded border text-xs capitalize ${aiSettings.baseTone === tone
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-800 text-white hover:border-white'
                        }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-neutral-500">Warmth</label>
                  <span className="text-xs text-white">{aiSettings.warmth}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={aiSettings.warmth}
                  onChange={(e) => setAiSettings({ ...aiSettings, warmth: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-neutral-500">Enthusiasm</label>
                  <span className="text-xs text-white">{aiSettings.enthusiasm}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={aiSettings.enthusiasm}
                  onChange={(e) => setAiSettings({ ...aiSettings, enthusiasm: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Formatting */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Formatting</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Emoji Usage</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'occasional', label: 'Occasional' },
                    { value: 'frequent', label: 'Frequent' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAiSettings({ ...aiSettings, emojiUsage: option.value })}
                      className={`px-3 py-2 rounded border text-xs ${aiSettings.emojiUsage === option.value
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-800 text-white hover:border-white'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-2">Response Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {['concise', 'balanced', 'detailed'].map((length) => (
                    <button
                      key={length}
                      onClick={() => setAiSettings({ ...aiSettings, responseLength: length })}
                      className={`px-3 py-2 rounded border text-xs capitalize ${aiSettings.responseLength === length
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-800 text-white hover:border-white'
                        }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded border border-neutral-800">
                <div>
                  <div className="text-white text-sm mb-1">Use Headers & Lists</div>
                  <div className="text-xs text-neutral-500">Organize responses with markdown</div>
                </div>
                <button
                  onClick={() => setAiSettings({ ...aiSettings, useHeaders: !aiSettings.useHeaders })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiSettings.useHeaders ? 'bg-white' : 'bg-neutral-800'
                    }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${aiSettings.useHeaders ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Custom Instructions</h4>
            <textarea
              value={aiSettings.customInstructions || ''}
              onChange={(e) => setAiSettings({ ...aiSettings, customInstructions: e.target.value })}
              placeholder="Add any specific instructions for the AI..."
              className="w-full h-24 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white resize-none"
            />
          </div>

          {/* Profile Connection */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white text-sm mb-1">Connect Learning Profile</div>
                <div className="text-xs text-neutral-500">Use your learning goals in AI responses</div>
              </div>
              <button
                onClick={() => setAiSettings({ ...aiSettings, profileEnabled: !aiSettings.profileEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${aiSettings.profileEnabled ? 'bg-white' : 'bg-neutral-800'
                  }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${aiSettings.profileEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
              </button>
            </div>

            {aiSettings.profileEnabled && (
              <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Learning Goals</label>
                  <input
                    type="text"
                    value={userContext.learningGoals || ''}
                    onChange={(e) => setUserContext({ ...userContext, learningGoals: e.target.value })}
                    placeholder="e.g., Master calculus"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Interests</label>
                  <input
                    type="text"
                    value={userContext.interests || ''}
                    onChange={(e) => setUserContext({ ...userContext, interests: e.target.value })}
                    placeholder="e.g., Physics, Computer Science"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={saveAISettings}
            disabled={savingSettings}
            className="w-full px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {savingSettings ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      )}

      {/* Profile */}
      {activeSettingsTab === 'profile' && (
        <div className="space-y-4">
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Profile Information</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm overflow-hidden">
                  {user.user.avatarUrl ? (
                    <img src={user.user.avatarUrl} alt={user.user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    user.user.displayName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.user.displayName}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user.user.role}</p>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-4 space-y-3">
                {user.profile && (
                  <>
                    {(user.profile as any).firstName && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Full Name</label>
                        <p className="text-sm text-white">{(user.profile as any).firstName} {(user.profile as any).lastName}</p>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).specialization && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Specialization</label>
                        <p className="text-sm text-white">{(user.profile as any).specialization}</p>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).qualification && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Qualification</label>
                        <p className="text-sm text-white">{(user.profile as any).qualification}</p>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).experience && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Experience</label>
                        <p className="text-sm text-white">{(user.profile as any).experience} years</p>
                      </div>
                    )}

                    {user.user.role === 'STUDENT' && (user.profile as any).grade && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Grade</label>
                        <p className="text-sm text-white">{(user.profile as any).grade}</p>
                      </div>
                    )}

                    {user.user.role === 'STUDENT' && (user.profile as any).institution && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Institution</label>
                        <p className="text-sm text-white">{(user.profile as any).institution}</p>
                      </div>
                    )}

                    {user.user.role === 'STUDENT' && (user.profile as any).interests && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Interests</label>
                        <p className="text-sm text-white">{(user.profile as any).interests}</p>
                      </div>
                    )}

                    {user.user.role === 'TEACHER' && (user.profile as any).bio && (
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1">Bio</label>
                        <p className="text-sm text-white">{(user.profile as any).bio}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Member Since</label>
                  <p className="text-sm text-white">
                    {new Date(user.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigate to Full Profile */}
          <div className="border border-neutral-800 rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">View Full Profile</h4>
            <button
              onClick={() => setShowProfileConfirm(true)}
              className="text-xs border border-neutral-800 text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-all"
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}
    </>
  );
}

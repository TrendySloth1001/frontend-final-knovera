/**
 * Teacher Signup Page
 * Complete teacher profile after OAuth - Multi-step form
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTempToken, signupAPI, clearTempToken } from '@/lib/api';
import { isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherSignupInput, Visibility } from '@/types/auth';
import { GraduationCap, Loader2, CheckCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { SPECIALIZATIONS, QUALIFICATIONS } from '@/lib/education-data';
import { useNotification } from '@/contexts/NotificationContext';
import { AIFormHelper } from '@/components/AIFormHelper';

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

export default function TeacherSignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TeacherSignupInput>({
    firstName: '',
    lastName: '',
    bio: '',
    specialization: '',
    qualification: '',
    experience: undefined,
    profileVisibility: 'PUBLIC' as Visibility,
    defaultContentMode: 'PUBLIC' as Visibility,
    allowFollowers: true,
  });
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);

  useEffect(() => {
    const token = getTempToken();
    
    if (!token || !isTempToken(token)) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'experience') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || undefined }));
    }
  };

  const toggleSpecialization = (tag: string) => {
    if (selectedSpecializations.includes(tag)) {
      setSelectedSpecializations(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedSpecializations(prev => [...prev, tag]);
    }
  };

  const toggleQualification = (tag: string) => {
    if (selectedQualifications.includes(tag)) {
      setSelectedQualifications(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedQualifications(prev => [...prev, tag]);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.firstName.trim() && formData.lastName.trim();
    }
    return true;
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First name and last name are required');
      }

      const submitData = {
        ...formData,
        specialization: selectedSpecializations.join(', ') || undefined,
        qualification: selectedQualifications.join(', ') || undefined,
      };

      const response = await signupAPI.teacher(submitData);
      
      // Login with the new token
      await login(response.token);
      
      // Clear temp token
      clearTempToken();
      
      // Show success notification
      showNotification('success', 'Onboarding completed successfully');
      
      // Redirect to home
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white text-black p-3 rounded-lg">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Teacher Profile</h1>
            <p className="text-white/60 text-sm">Step {currentStep} of 4</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-white' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6">Basic Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-white/60">
                    Bio
                  </label>
                  <AIFormHelper
                    fieldType="bio"
                    context={`${formData.firstName} ${formData.lastName}, teacher with ${formData.experience || 0} years experience`}
                    maxLength={150}
                    onSuggestion={(suggestion) => {
                      setFormData(prev => ({ ...prev, bio: suggestion }));
                    }}
                    label="AI help"
                  />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="Tell students about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Step 2: Specializations */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Select Specializations</h2>
                <p className="text-white/60 text-sm mt-1">Choose as many as you like</p>
                <p className="text-white/40 text-xs mt-2">
                  {selectedSpecializations.length} selected
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {SPECIALIZATIONS.map((tag, index) => {
                  const isSelected = selectedSpecializations.includes(tag);
                  const colorClass = TAG_COLORS[index % TAG_COLORS.length];
                  
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSpecialization(tag)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : `${colorClass} hover:scale-105`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="w-4 h-4" />}
                        {tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Qualifications */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Select Qualifications</h2>
                <p className="text-white/60 text-sm mt-1">Choose as many as you like</p>
                <p className="text-white/40 text-xs mt-2">
                  {selectedQualifications.length} selected
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {QUALIFICATIONS.map((tag, index) => {
                  const isSelected = selectedQualifications.includes(tag);
                  const colorClass = TAG_COLORS[index % TAG_COLORS.length];
                  
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQualification(tag)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : `${colorClass} hover:scale-105`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="w-4 h-4" />}
                        {tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Privacy Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Profile Visibility
                </label>
                <select
                  name="profileVisibility"
                  value={formData.profileVisibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FOLLOWERS_ONLY">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Default Content Visibility
                </label>
                <select
                  name="defaultContentMode"
                  value={formData.defaultContentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FOLLOWERS_ONLY">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="allowFollowers"
                  name="allowFollowers"
                  checked={formData.allowFollowers}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label htmlFor="allowFollowers" className="text-sm">
                  Allow students to follow me
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !canProceed()}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

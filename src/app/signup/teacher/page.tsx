/**
 * Teacher Signup Page
 * Complete teacher profile after OAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTempToken, signupAPI, clearTempToken } from '@/lib/api';
import { isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherSignupInput, Visibility } from '@/types/auth';
import { GraduationCap, Loader2, CheckCircle } from 'lucide-react';

export default function TeacherSignupPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First name and last name are required');
      }

      const response = await signupAPI.teacher(formData);
      
      // Login with the new token
      await login(response.token);
      
      // Clear temp token
      clearTempToken();
      
      // Redirect to home
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white text-black p-3 rounded-full">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Complete Teacher Profile</h1>
            <p className="text-gray-400">Tell us more about yourself</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-600 rounded text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold mb-2 text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold mb-2 text-gray-300">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold mb-2 text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
              placeholder="Tell students about yourself..."
            />
          </div>

          {/* Professional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="specialization" className="block text-sm font-semibold mb-2 text-gray-300">
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <label htmlFor="qualification" className="block text-sm font-semibold mb-2 text-gray-300">
                Qualification
              </label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="e.g., M.Ed, Ph.D"
              />
            </div>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-semibold mb-2 text-gray-300">
              Years of Experience
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
              placeholder="0"
            />
          </div>

          {/* Privacy Settings */}
          <div className="border-t-2 border-gray-700 pt-6">
            <h3 className="font-bold mb-4 text-white">Privacy Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="profileVisibility" className="block text-sm font-semibold mb-2 text-gray-300">
                  Profile Visibility
                </label>
                <select
                  id="profileVisibility"
                  name="profileVisibility"
                  value={formData.profileVisibility}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FOLLOWERS_ONLY">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div>
                <label htmlFor="defaultContentMode" className="block text-sm font-semibold mb-2 text-gray-300">
                  Default Content Visibility
                </label>
                <select
                  id="defaultContentMode"
                  name="defaultContentMode"
                  value={formData.defaultContentMode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FOLLOWERS_ONLY">Followers Only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowFollowers"
                  name="allowFollowers"
                  checked={formData.allowFollowers}
                  onChange={handleChange}
                  className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-white"
                />
                <label htmlFor="allowFollowers" className="text-sm font-semibold">
                  Allow students to follow me
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating Profile...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Complete Signup
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Student Signup Page
 * Complete student profile after OAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTempToken, signupAPI, clearTempToken } from '@/lib/api';
import { isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { StudentSignupInput } from '@/types/auth';
import { BookOpen, Loader2, CheckCircle } from 'lucide-react';

export default function StudentSignupPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<StudentSignupInput>({
    firstName: '',
    lastName: '',
    grade: '',
    institution: '',
    interests: '',
  });

  useEffect(() => {
    const token = getTempToken();
    
    if (!token || !isTempToken(token)) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First name and last name are required');
      }

      const response = await signupAPI.student(formData);
      
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
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Complete Student Profile</h1>
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
                placeholder="Jane"
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
                placeholder="Smith"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-semibold mb-2 text-gray-300">
                Grade/Year
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="e.g., 10th Grade, Year 2"
              />
            </div>
            <div>
              <label htmlFor="institution" className="block text-sm font-semibold mb-2 text-gray-300">
                School/Institution
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
                placeholder="Your school name"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label htmlFor="interests" className="block text-sm font-semibold mb-2 text-gray-300">
              Interests
            </label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white rounded focus:border-white focus:outline-none"
              placeholder="What subjects or topics are you interested in?"
            />
            <p className="mt-2 text-sm text-gray-600">
              This helps us recommend relevant content and connect you with teachers
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gray-800 border-2 border-gray-700 rounded p-4">
            <h3 className="font-semibold mb-2 text-white">What's Next?</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Browse courses and materials
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Follow teachers for updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                Track your learning progress
              </li>
            </ul>
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

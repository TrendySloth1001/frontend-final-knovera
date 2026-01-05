/**
 * Login Page
 * Google OAuth authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleButton from '@/components/GoogleButton';
import { Lock, GraduationCap, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, hasTempToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    } else if (hasTempToken) {
      router.push('/signup/select-role');
    }
  }, [isAuthenticated, hasTempToken, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-black rounded-full mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Knover</h1>
          <p className="text-gray-400">Sign in to access your account</p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-8">
          <GoogleButton />
        </div>

        {/* Features */}
        <div className="border-t-2 border-gray-700 pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-gray-800 p-2 rounded">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">For Teachers</div>
              <div className="text-sm text-gray-400">Create and share educational content</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-gray-800 p-2 rounded">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">For Students</div>
              <div className="text-sm text-gray-400">Access learning materials and track progress</div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          First time? You'll complete your profile after signing in with Google
        </div>
      </div>
    </div>
  );
}

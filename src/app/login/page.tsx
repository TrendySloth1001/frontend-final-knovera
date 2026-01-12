/**
 * Login Page
 * Google OAuth authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginBoard from '@/components/LoginBoard';

export default function LoginPage() {
  const { isAuthenticated, hasTempToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else if (hasTempToken) {
      router.push('/signup/select-role');
    }
  }, [isAuthenticated, hasTempToken, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <LoginBoard />;
}

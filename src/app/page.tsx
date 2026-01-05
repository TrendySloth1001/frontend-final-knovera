/**
 * Home Page
 * Displays authentication status and token information
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import TokenDisplay from '@/components/TokenDisplay';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, token, tokenPayload, isAuthenticated, hasTempToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (hasTempToken) {
        router.push('/signup/select-role');
      } else if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, hasTempToken, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-white" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">
          Welcome back, {user?.user.displayName}! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          You're signed in as a <span className="font-semibold text-white">{user?.user.role}</span>
        </p>
      </div>

      {/* Token Information */}
      <TokenDisplay token={token} tokenPayload={tokenPayload} user={user} />

      {/* API Endpoints Reference */}
      <div className="mt-8 bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Available API Endpoints</h2>
        <div className="space-y-3 font-mono text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold text-xs">GET</span>
            <span>/api/auth/google</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold text-xs">GET</span>
            <span>/api/auth/google/callback</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold text-xs">GET</span>
            <span>/api/auth/me</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold text-xs">DELETE</span>
            <span>/api/auth/logout</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-semibold text-xs">PATCH</span>
            <span>/api/auth/deactivate</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">POST</span>
            <span>/api/signup/teacher</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">POST</span>
            <span>/api/signup/student</span>
          </div>
        </div>
      </div>
    </div>
  );
}


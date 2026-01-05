/**
 * Home Page
 * Displays authentication status and token information
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import TokenDisplay from '@/components/TokenDisplay';
import Link from 'next/link';
import { LogIn, Loader2, Shield, Key } from 'lucide-react';

export default function Home() {
  const { user, token, tokenPayload, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <div className="bg-white border-2 border-black rounded-lg p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Knovera</h1>
          <p className="text-gray-600 text-lg mb-8">
            An education platform connecting teachers and students.
            <br />
            Sign in to access your account and view your authentication details.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            <LogIn size={20} />
            Sign In with Google
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <div className="bg-gray-100 p-3 rounded-lg inline-block mb-4">
              <Key size={24} />
            </div>
            <h3 className="font-bold mb-2">JWT Authentication</h3>
            <p className="text-sm text-gray-600">
              Secure token-based authentication with Google OAuth integration
            </p>
          </div>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <div className="bg-gray-100 p-3 rounded-lg inline-block mb-4">
              <Shield size={24} />
            </div>
            <h3 className="font-bold mb-2">Token Details</h3>
            <p className="text-sm text-gray-600">
              View complete token payload and user profile information
            </p>
          </div>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <div className="bg-gray-100 p-3 rounded-lg inline-block mb-4">
              <LogIn size={24} />
            </div>
            <h3 className="font-bold mb-2">Easy Setup</h3>
            <p className="text-sm text-gray-600">
              Simple Google sign-in with role-based profile completion
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.user.displayName}
        </h1>
        <p className="text-gray-600 text-lg">
          You're signed in as a <span className="font-semibold">{user?.user.role}</span>
        </p>
      </div>

      {/* Token Information */}
      <TokenDisplay token={token} tokenPayload={tokenPayload} user={user} />

      {/* API Endpoints Reference */}
      <div className="mt-8 bg-white border-2 border-black rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Available API Endpoints</h2>
        <div className="space-y-3 font-mono text-sm">
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


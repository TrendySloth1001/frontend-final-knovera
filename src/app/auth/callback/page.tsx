/**
 * OAuth Callback Page
 * Handles Google OAuth redirect and token processing
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken, setTempToken } from '@/lib/api';
import { decodeToken, isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL query params
        const token = searchParams.get('token');
        const tempToken = searchParams.get('tempToken');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        const authToken = token || tempToken;

        if (!authToken) {
          setStatus('error');
          setMessage('No token received from authentication');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Decode and check token type
        const payload = decodeToken(authToken);
        
        if (!payload) {
          setStatus('error');
          setMessage('Invalid token received');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Check if it's a temporary token
        if (isTempToken(authToken)) {
          setTempToken(authToken);
          
          // Redirect to role selection immediately
          router.push('/signup/select-role');
        } else {
          // Full token - user is authenticated
          setAuthToken(authToken);
          await refreshUser();

          // Show success notification
          showNotification('success', 'Logged in successfully');

          // Redirect to home immediately
          router.push('/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin h-16 w-16 mx-auto mb-4 text-white" />
            <h2 className="text-xl font-bold mb-2 text-white">Processing...</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-2 text-white">Success!</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2 text-white">Error</h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

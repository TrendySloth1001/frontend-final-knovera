/**
 * OAuth Callback Page
 * Handles Google OAuth redirect and token processing
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken, setTempToken } from '@/lib/api';
import { decodeToken, isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
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
          setStatus('success');
          setMessage('Please complete your profile...');
          
          // Redirect to role selection
          setTimeout(() => {
            router.push('/signup/select-role');
          }, 1500);
        } else {
          // Full token - user is authenticated
          setAuthToken(authToken);
          await refreshUser();
          setStatus('success');
          setMessage('Authentication successful!');
          
          setTimeout(() => {
            router.push('/');
          }, 1500);
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
      <div className="bg-white border-2 border-black rounded-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Processing...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

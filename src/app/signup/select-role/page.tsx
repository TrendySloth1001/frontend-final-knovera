/**
 * Role Selection Page
 * Choose between Teacher and Student after OAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTempToken, clearTempToken } from '@/lib/api';
import { decodeToken, isTempToken } from '@/lib/token';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTempToken();
    
    if (!token || !isTempToken(token)) {
      router.push('/login');
      return;
    }

    const payload = decodeToken(token);
    if (payload) {
      setEmail(payload.email);
    }
    
    setLoading(false);
  }, [router]);

  const handleBackToLogin = async () => {
    clearTempToken();
    await refreshUser();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 px-4">
      {/* Back Button */}
      <button
        onClick={handleBackToLogin}
        className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back to Login</span>
      </button>

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-3 text-white">Choose Your Role</h1>
        <p className="text-white/60">
          <span className="text-white">{email}</span>
        </p>
      </div>

      {/* Role Cards */}
      <div className="space-y-4">
        {/* Teacher Card */}
        <button
          onClick={() => router.push('/signup/teacher')}
          className="w-full bg-black border border-white/20 rounded-lg p-4 hover:border-white/30 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Teacher</h2>
                <p className="text-xs text-white/60">
                  Create content, manage students, and track progress
                </p>
              </div>
            </div>
            <ArrowRight className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" size={18} />
          </div>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-3 text-xs text-white/40">or</span>
          </div>
        </div>

        {/* Student Card */}
        <button
          onClick={() => router.push('/signup/student')}
          className="w-full bg-black border border-white/20 rounded-lg p-4 hover:border-white/30 transition-all group text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-0.5">Student</h2>
                <p className="text-xs text-white/60">
                  Access learning materials and track your progress
                </p>
              </div>
            </div>
            <ArrowRight className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" size={18} />
          </div>
        </button>
      </div>
    </div>
  );
}

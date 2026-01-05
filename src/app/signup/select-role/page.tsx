/**
 * Role Selection Page
 * Choose between Teacher and Student after OAuth
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTempToken } from '@/lib/api';
import { decodeToken, isTempToken } from '@/lib/token';
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react';

export default function SelectRolePage() {
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Knovera!</h1>
        <p className="text-gray-600 text-lg">
          Hi <span className="font-semibold">{email}</span>! 
          <br />
          Please select your role to complete your profile
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Teacher Card */}
        <button
          onClick={() => router.push('/signup/teacher')}
          className="bg-white border-2 border-black rounded-lg p-8 hover:bg-gray-50 transition-all hover:shadow-lg group text-left"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="bg-black text-white p-4 rounded-full">
              <GraduationCap size={32} />
            </div>
            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">I'm a Teacher</h2>
          <p className="text-gray-600 mb-4">
            Create and share educational content, manage students, and track their progress.
          </p>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Create courses and assignments
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Share resources with students
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Grade and provide feedback
            </li>
          </ul>
        </button>

        {/* Student Card */}
        <button
          onClick={() => router.push('/signup/student')}
          className="bg-white border-2 border-black rounded-lg p-8 hover:bg-gray-50 transition-all hover:shadow-lg group text-left"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="bg-black text-white p-4 rounded-full">
              <BookOpen size={32} />
            </div>
            <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
          </div>
          
          <h2 className="text-2xl font-bold mb-3">I'm a Student</h2>
          <p className="text-gray-600 mb-4">
            Access learning materials, complete assignments, and track your academic progress.
          </p>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Access course materials
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Submit assignments
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
              Track your progress
            </li>
          </ul>
        </button>
      </div>
    </div>
  );
}

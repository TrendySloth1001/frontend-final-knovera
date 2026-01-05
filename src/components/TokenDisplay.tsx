/**
 * Token Display Component
 * Shows decoded JWT payload and user data
 */

'use client';

import { JWTPayload, UserProfileResponse } from '@/types/auth';
import { Copy, Check, User, Mail, Shield, Clock, Key } from 'lucide-react';
import { useState } from 'react';

interface TokenDisplayProps {
  token: string | null;
  tokenPayload: JWTPayload | null;
  user: UserProfileResponse | null;
}

export default function TokenDisplay({ token, tokenPayload, user }: TokenDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!token || !tokenPayload) {
    return (
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <div className="text-center text-gray-500">
          No authentication token found. Please sign in.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* JWT Token */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Key size={24} />
            JWT Token
          </h2>
          <button
            onClick={copyToken}
            className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded font-mono text-xs break-all">
          {token}
        </div>
      </div>

      {/* Token Payload */}
      <div className="bg-white border-2 border-black rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield size={24} />
          Token Payload
        </h2>
        <div className="space-y-3">
          <DataRow icon={<User size={18} />} label="User ID" value={tokenPayload.userId} />
          <DataRow icon={<Mail size={18} />} label="Email" value={tokenPayload.email} />
          <DataRow icon={<Shield size={18} />} label="Role" value={tokenPayload.role} />
          {tokenPayload.isTemp && (
            <DataRow icon={<Clock size={18} />} label="Token Type" value="TEMPORARY" className="text-orange-600" />
          )}
          {tokenPayload.iat && (
            <DataRow 
              icon={<Clock size={18} />} 
              label="Issued At" 
              value={new Date(tokenPayload.iat * 1000).toLocaleString()} 
            />
          )}
          {tokenPayload.exp && (
            <DataRow 
              icon={<Clock size={18} />} 
              label="Expires At" 
              value={new Date(tokenPayload.exp * 1000).toLocaleString()} 
            />
          )}
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="bg-white border-2 border-black rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User size={24} />
            User Profile
          </h2>
          <div className="space-y-3">
            <DataRow label="Display Name" value={user.user.displayName} />
            <DataRow label="Email" value={user.user.email} />
            <DataRow label="Role" value={user.user.role} />
            <DataRow label="Active Status" value={user.user.isActive ? 'Active' : 'Inactive'} />
            <DataRow 
              label="Last Login" 
              value={user.user.lastLoginAt ? new Date(user.user.lastLoginAt).toLocaleString() : 'Never'} 
            />
            <DataRow 
              label="Account Created" 
              value={new Date(user.user.createdAt).toLocaleString()} 
            />
          </div>

          {/* Profile Details */}
          {user.profile && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="font-bold mb-3">
                {user.user.role === 'TEACHER' ? 'Teacher' : 'Student'} Profile
              </h3>
              <div className="space-y-3">
                <DataRow label="First Name" value={user.profile.firstName} />
                <DataRow label="Last Name" value={user.profile.lastName} />
                
                {'bio' in user.profile && (
                  <>
                    {user.profile.bio && <DataRow label="Bio" value={user.profile.bio} />}
                    {user.profile.specialization && <DataRow label="Specialization" value={user.profile.specialization} />}
                    {user.profile.qualification && <DataRow label="Qualification" value={user.profile.qualification} />}
                    {user.profile.experience !== null && user.profile.experience !== undefined && (
                      <DataRow label="Experience" value={`${user.profile.experience} years`} />
                    )}
                    <DataRow label="Profile Visibility" value={user.profile.profileVisibility} />
                    <DataRow label="Default Content Mode" value={user.profile.defaultContentMode} />
                    <DataRow label="Allow Followers" value={user.profile.allowFollowers ? 'Yes' : 'No'} />
                    <DataRow label="Followers Count" value={(user.profile.followersCount ?? 0).toString()} />
                    <DataRow label="Content Count" value={(user.profile.contentCount ?? 0).toString()} />
                  </>
                )}
                
                {'grade' in user.profile && (
                  <>
                    {user.profile.grade && <DataRow label="Grade" value={user.profile.grade} />}
                    {user.profile.institution && <DataRow label="Institution" value={user.profile.institution} />}
                    {user.profile.interests && <DataRow label="Interests" value={user.profile.interests} />}
                    <DataRow label="Following Count" value={(user.profile.followingCount ?? 0).toString()} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DataRowProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

function DataRow({ icon, label, value, className = '' }: DataRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-gray-600 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`font-medium ${className}`}>{value}</div>
      </div>
    </div>
  );
}

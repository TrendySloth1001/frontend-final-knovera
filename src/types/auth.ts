/**
 * Authentication Types
 * Matches backend API contracts
 */

export type UserRole = 'TEACHER' | 'STUDENT';
export type Visibility = 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  isTemp?: boolean;
  iat?: number;
  exp?: number;
}

// Auth Response (full login)
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    avatarUrl?: string | null;
  };
  token: string;
  expiresIn: string;
}

// Temp Token Response (OAuth → signup redirect)
export interface TempTokenResponse {
  tempToken: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  message: string;
}

// User Profile Response (GET /auth/me)
export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    avatarUrl?: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
  profile: TeacherProfile | StudentProfile;
}

export interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  specialization?: string | null;
  qualification?: string | null;
  experience?: number | null;
  profileVisibility: string;
  defaultContentMode: string;
  allowFollowers: boolean;
  followersCount: number;
  contentCount: number;
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  grade?: string | null;
  institution?: string | null;
  interests?: string | null;
  followingCount: number;
}

// Teacher Signup Input
export interface TeacherSignupInput {
  firstName: string;
  lastName: string;
  bio?: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  profileVisibility?: Visibility;
  defaultContentMode?: Visibility;
  allowFollowers?: boolean;
}

// Student Signup Input
export interface StudentSignupInput {
  firstName: string;
  lastName: string;
  grade?: string;
  institution?: string;
  interests?: string;
}

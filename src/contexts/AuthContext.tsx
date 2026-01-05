/**
 * Authentication Context
 * Global auth state management
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload, UserProfileResponse } from '@/types/auth';
import { authAPI, getAuthToken, getTempToken, clearAllTokens } from '@/lib/api';
import { decodeToken, isTokenValid } from '@/lib/token';
import { useNotification } from '@/contexts/NotificationContext';

interface AuthContextType {
  user: UserProfileResponse | null;
  token: string | null;
  tokenPayload: JWTPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasTempToken: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenPayload, setTokenPayload] = useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showNotification } = useNotification();

  const refreshUser = useCallback(async () => {
    // Check for both regular token and temp token
    let currentToken = getAuthToken();
    if (!currentToken) {
      currentToken = getTempToken();
    }
    
    if (!currentToken || !isTokenValid(currentToken)) {
      setUser(null);
      setToken(null);
      setTokenPayload(null);
      clearAllTokens();
      return;
    }

    const payload = decodeToken(currentToken);
    
    // Don't fetch user data for temp tokens
    if (payload?.isTemp) {
      setUser(null);
      setToken(currentToken);
      setTokenPayload(payload);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUser(userData);
      setToken(currentToken);
      setTokenPayload(payload);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Handle 404 or any error - user is logged out
      if (error instanceof Error && error.message.includes('404')) {
        showNotification('warning', 'You have been logged out');
      } else {
        showNotification('error', 'Session expired. Please log in again');
      }
      clearAllTokens();
      setUser(null);
      setToken(null);
      setTokenPayload(null);
    }
  }, [showNotification]);

  const login = async (newToken: string) => {
    setToken(newToken);
    const payload = decodeToken(newToken);
    setTokenPayload(payload);
    
    // If it's not a temp token, fetch user data immediately
    if (payload && !payload.isTemp) {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
      }
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      showNotification('info', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setTokenPayload(null);
      clearAllTokens();
      router.push('/login');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    token,
    tokenPayload,
    isLoading,
    isAuthenticated: !!user && !!token && !tokenPayload?.isTemp,
    hasTempToken: !!token && !!tokenPayload?.isTemp,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

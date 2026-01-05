/**
 * Token Utilities
 * JWT decoding and validation
 */

import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '@/types/auth';

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  return Date.now() >= decoded.exp * 1000;
}

export function isTokenValid(token: string): boolean {
  const decoded = decodeToken(token);
  return decoded !== null && !isTokenExpired(token);
}

export function isTempToken(token: string): boolean {
  const decoded = decodeToken(token);
  return decoded?.isTemp === true;
}

/**
 * API Utility Functions
 * HTTP client with token management
 */

import Cookies from 'js-cookie';
import { 
  AuthResponse, 
  TempTokenResponse, 
  UserProfileResponse,
  TeacherSignupInput,
  StudentSignupInput
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Token management
export const TOKEN_KEY = 'auth_token';
export const TEMP_TOKEN_KEY = 'temp_token';

export function setAuthToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
}

export function setTempToken(token: string): void {
  Cookies.set(TEMP_TOKEN_KEY, token, { expires: 1 / 24 }); // 1 hour
}

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getTempToken(): string | undefined {
  return Cookies.get(TEMP_TOKEN_KEY);
}

export function clearAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function clearTempToken(): void {
  Cookies.remove(TEMP_TOKEN_KEY);
}

export function clearAllTokens(): void {
  clearAuthToken();
  clearTempToken();
}

// HTTP client
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken() || getTempToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with any existing headers
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[API] No auth token found for request:', endpoint);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    console.error('[API] Request failed:', {
      endpoint,
      status: response.status,
      error,
      hasToken: !!token
    });
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Generic API client for other features
export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },
  
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
  
  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};

// Auth API endpoints
export const authAPI = {
  // Initiate Google OAuth
  googleLogin: (): string => {
    return `${API_BASE_URL}/api/auth/google`;
  },

  // Get current user profile
  getMe: async (): Promise<UserProfileResponse> => {
    const response = await apiRequest<{ success: boolean; data: UserProfileResponse }>('/api/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiRequest('/api/auth/logout', { method: 'DELETE' });
    clearAllTokens();
  },

  // Deactivate account
  deactivate: async (): Promise<void> => {
    await apiRequest('/api/auth/deactivate', { method: 'PATCH' });
    clearAllTokens();
  },
};

// Signup API endpoints
export const signupAPI = {
  // Complete teacher signup
  teacher: async (data: TeacherSignupInput): Promise<AuthResponse> => {
    const response = await apiRequest<{ success: boolean; data: AuthResponse }>(
      '/api/signup/teacher',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Save the full token after signup
    if (response.data.token) {
      clearTempToken();
      setAuthToken(response.data.token);
    }
    
    return response.data;
  },

  // Complete student signup
  student: async (data: StudentSignupInput): Promise<AuthResponse> => {
    const response = await apiRequest<{ success: boolean; data: AuthResponse }>(
      '/api/signup/student',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    
    // Save the full token after signup
    if (response.data.token) {
      clearTempToken();
      setAuthToken(response.data.token);
    }
    
    return response.data;
  },
};

// Study Plan API endpoints
export const studyPlanAPI = {
  // Generate study plan
  generate: async (data: { conversationId: string; subject: string; goal: string }) => {
    const token = getAuthToken();
    const response = await fetch('http://localhost:3001/api/study-plans/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  // Poll for status
  getStatus: async (planId: string) => {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:3001/api/study-plans/status/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  // Get by conversation
  getByConversation: async (conversationId: string) => {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:3001/api/study-plans/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  // Get job status
  getJobStatus: async (planId: string) => {
    const token = getAuthToken();
    const response = await fetch(`http://localhost:3001/api/study-plans/job/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

// Teacher Discovery API
export const teacherApi = {
  // Get all teachers with optional search/filter
  getAll: async (params?: { search?: string; specialization?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.specialization) queryParams.append('specialization', params.specialization);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/teachers?${queryString}` : '/api/teachers';
    
    return apiClient.get(endpoint);
  },

  // Get single teacher profile
  getById: async (teacherId: string) => {
    return apiClient.get(`/api/teachers/${teacherId}`);
  },

  // Follow a teacher
  follow: async (teacherId: string) => {
    return apiClient.post(`/api/teachers/${teacherId}/follow`);
  },

  // Unfollow a teacher
  unfollow: async (teacherId: string) => {
    return apiClient.delete(`/api/teachers/${teacherId}/follow`);
  },
};

// Profile API endpoints
export const profileAPI = {
  // Get current user's profile
  getMe: async () => {
    return apiClient.get('/api/profile/me');
  },

  // Update teacher profile
  updateTeacher: async (teacherId: string, data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    specialization?: string;
    qualification?: string;
    experience?: number;
  }) => {
    return apiClient.put(`/api/profile/teacher/${teacherId}`, data);
  },

  // Update student profile
  updateStudent: async (studentId: string, data: {
    firstName?: string;
    lastName?: string;
    grade?: string;
    institution?: string;
    interests?: string;
  }) => {
    return apiClient.put(`/api/profile/student/${studentId}`, data);
  },
};

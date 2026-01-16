/**
 * Avatar API
 * Client-side API for avatar management
 */

const API_BASE_URL = 'http://localhost:3001/api/avatar';

interface PredefinedAvatar {
  id: string;
  url: string;
  filename: string;
}

class AvatarAPI {
  /**
   * Get predefined avatars
   */
  async getPredefinedAvatars(token: string): Promise<PredefinedAvatar[]> {
    console.log('[AvatarAPI] Fetching from:', `${API_BASE_URL}/predefined`);
    const response = await fetch(`${API_BASE_URL}/predefined`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[AvatarAPI] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AvatarAPI] Error response:', errorData);
      throw new Error('Failed to fetch predefined avatars');
    }

    const data = await response.json();
    console.log('[AvatarAPI] Response data:', data);
    return data;
  }

  /**
   * Get user's custom avatars
   * Returns only the logged-in user's personal uploads (PRIVATE)
   * Other users cannot see these avatars
   */
  async getUserAvatars(token: string): Promise<PredefinedAvatar[]> {
    console.log('[AvatarAPI] Fetching user avatars from:', `${API_BASE_URL}/my-avatars`);
    const response = await fetch(`${API_BASE_URL}/my-avatars`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AvatarAPI] Error response:', errorData);
      throw new Error('Failed to fetch user avatars');
    }

    const data = await response.json();
    console.log('[AvatarAPI] User avatars data:', data);
    return data;
  }

  /**
   * Upload custom avatar
   */
  async uploadCustomAvatar(token: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload avatar');
    }

    return response.json();
  }

  /**
   * Set avatar (select predefined)
   */
  async setAvatar(token: string, avatarUrl: string): Promise<{ success: boolean; avatarUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to set avatar');
    }

    return response.json();
  }

  /**
   * Remove avatar
   */
  async removeAvatar(token: string): Promise<{ success: boolean }> {
    const response = await fetch(API_BASE_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove avatar');
    }

    return response.json();
  }
}

export const avatarAPI = new AvatarAPI();
export type { PredefinedAvatar };

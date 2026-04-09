/**
 * Resolves a media URL to an absolute URL.
 *
 * Backend URLs may be relative paths (e.g. "/api/chat/media/file.jpg")
 * that need to be resolved against the API origin, not the Next.js origin.
 */
const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : 'http://localhost:3001';

export function resolveMediaUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  // Relative path → prepend API origin
  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
}

/**
 * Returns a UI Avatars fallback URL for a given display name.
 */
export function avatarFallbackUrl(name: string): string {
  const initials = encodeURIComponent(name?.trim() || 'U');
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
}

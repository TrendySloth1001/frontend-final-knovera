// Group share link utilities

export interface GroupShareLinkData {
  groupId: string;
  groupName: string;
  url: string;
}

/**
 * Generate a shareable link for a group
 */
export function generateGroupShareLink(groupId: string, groupName: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return `${baseUrl}/dashboard#group/${groupId}`;
}

/**
 * Detect if a message contains a group share link
 */
export function detectGroupShareLink(text: string): GroupShareLinkData | null {
  const groupLinkRegex = /(?:https?:\/\/[^\/]+)?\/dashboard#group\/([a-f0-9-]+)/i;
  const match = text.match(groupLinkRegex);

  if (match) {
    return {
      groupId: match[1],
      groupName: '', // Will be fetched
      url: match[0],
    };
  }

  return null;
}

/**
 * Parse message content and extract group share links
 */
export function parseGroupShareLinks(content: string): {
  text: string;
  groupLinks: GroupShareLinkData[];
} {
  const groupLinks: GroupShareLinkData[] = [];
  let text = content;

  const groupLinkRegex = /(?:https?:\/\/[^\/\s]+)?\/dashboard#group\/([a-f0-9-]+)/gi;
  const matches = Array.from(content.matchAll(groupLinkRegex));

  for (const match of matches) {
    groupLinks.push({
      groupId: match[1],
      groupName: '',
      url: match[0],
    });

    // Replace the URL with a placeholder
    text = text.replace(match[0], '');
  }

  return { text: text.trim(), groupLinks };
}

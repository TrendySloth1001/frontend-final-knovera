/**
 * URL detection and linkification utilities
 */

// URL regex pattern - matches http(s), www, and common TLDs
const URL_REGEX = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/gi;

export interface TextPart {
  type: 'text' | 'link' | 'email';
  content: string;
  href?: string;
}

/**
 * Parse text and extract URLs, emails, and plain text
 */
export function parseTextWithLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // Find all matches
  const matches = Array.from(text.matchAll(URL_REGEX));

  matches.forEach((match) => {
    const matchedText = match[0];
    const matchIndex = match.index!;

    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, matchIndex)
      });
    }

    // Determine type and href
    let type: 'link' | 'email' = 'link';
    let href = matchedText;

    if (matchedText.includes('@')) {
      type = 'email';
      href = `mailto:${matchedText}`;
    } else if (matchedText.startsWith('www.')) {
      href = `https://${matchedText}`;
    }

    parts.push({
      type,
      content: matchedText,
      href
    });

    lastIndex = matchIndex + matchedText.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}

/**
 * Check if a string contains any URLs
 */
export function containsURL(text: string): boolean {
  return URL_REGEX.test(text);
}

/**
 * Extract all URLs from text
 */
export function extractURLs(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches || [];
}

/**
 * Mention syntax: @[userId:displayName]
 * Example: @[abc123:John Doe]
 */

export interface ParsedMention {
  userId: string;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse text to extract mentions
 * @param text - The text containing mentions
 * @returns Array of parsed mentions
 */
export function parseMentions(text: string): ParsedMention[] {
  const mentionRegex = /@\[([^:]+):([^\]]+)\]/g;
  const mentions: ParsedMention[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      userId: match[1],
      displayName: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Extract mentioned user IDs from text
 * @param text - The text containing mentions
 * @returns Array of unique user IDs
 */
export function extractMentionedUserIds(text: string): string[] {
  const mentions = parseMentions(text);
  return Array.from(new Set(mentions.map((m) => m.userId)));
}

/**
 * Convert text with mentions to display text (showing only display names)
 * @param text - The text containing mention syntax
 * @returns Text with mentions replaced by @displayName
 */
export function mentionToDisplayText(text: string): string {
  return text.replace(/@\[([^:]+):([^\]]+)\]/g, '@$2');
}

/**
 * Split text into segments (plain text and mentions)
 * Used for rendering with styled mention components
 */
export interface TextSegment {
  type: 'text' | 'mention';
  content: string;
  userId?: string;
  displayName?: string;
}

export function splitTextWithMentions(text: string): TextSegment[] {
  const mentions = parseMentions(text);
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  mentions.forEach((mention) => {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, mention.startIndex),
      });
    }

    // Add mention
    segments.push({
      type: 'mention',
      content: text.slice(mention.startIndex, mention.endIndex),
      userId: mention.userId,
      displayName: mention.displayName,
    });

    lastIndex = mention.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Insert mention into text at cursor position
 * @param text - Current text
 * @param cursorPosition - Cursor position in text
 * @param userId - User ID to mention
 * @param displayName - Display name to show
 * @returns Object with new text and cursor position
 */
export function insertMention(
  text: string,
  cursorPosition: number,
  userId: string,
  displayName: string
): { text: string; cursorPosition: number } {
  // Find the start of the @ mention
  let mentionStart = cursorPosition - 1;
  while (mentionStart > 0 && text[mentionStart] !== '@') {
    mentionStart--;
  }

  // Replace from @ to cursor position with mention syntax
  const mention = `@[${userId}:${displayName}]`;
  const newText =
    text.slice(0, mentionStart) + mention + ' ' + text.slice(cursorPosition);
  const newCursorPosition = mentionStart + mention.length + 1;

  return {
    text: newText,
    cursorPosition: newCursorPosition,
  };
}

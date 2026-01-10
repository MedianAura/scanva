/**
 * Checks if a pattern exists within content.
 *
 * Supports multiple pattern types:
 * - RegExp: Uses pattern.test(content)
 * - string[]: Uses pattern.some(p => content.includes(p))
 * - string: Uses content.includes(pattern)
 *
 * @param pattern - A string, RegExp, or array of strings to match
 * @param content - The content to search within
 * @returns true if the pattern is found in content, false otherwise
 */
export function hasPatternMatch(pattern: string | RegExp | string[], content: string): boolean {
  if (!content) {
    return false;
  }

  if (pattern instanceof RegExp) {
    return pattern.test(content);
  }

  if (Array.isArray(pattern)) {
    return pattern.some((p) => content.includes(p));
  }

  return content.includes(pattern as string);
}

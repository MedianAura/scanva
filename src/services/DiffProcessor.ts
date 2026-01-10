import { getDiffContent } from '../helpers/git.js';
import { hasPatternMatch } from '../helpers/patternMatcher.js';

export class DiffProcessor {
  private diffContent: string | undefined;

  /**
   * Retrieves git diff content from the git helper.
   * Caches the result so subsequent calls return the cached content.
   * Throws error if git command fails or .git directory not found.
   * @param commitReference - git reference to diff against (default: 'HEAD')
   * @returns git diff as string
   */
  public getDiffContent(commitReference: string = 'HEAD'): string {
    if (this.diffContent !== undefined) {
      return this.diffContent;
    }

    this.diffContent = getDiffContent(commitReference);
    return this.diffContent;
  }

  /**
   * Checks if a pattern exists in the git diff content.
   * @param pattern - string, RegExp, or array of strings to check
   * @param diffContent - the diff content to search in
   * @returns true if pattern is found in diff, false otherwise
   */
  public hasPatternInDiff(pattern: string | RegExp | string[], diffContent: string): boolean {
    return hasPatternMatch(pattern, diffContent);
  }
}

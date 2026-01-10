import { spawnSync } from 'node:child_process';
import { Logger } from '../helpers/logger.js';

export class DiffProcessor {
  private diffContent: string | undefined;

  /**
   * Retrieves git diff content using spawnSync.
   * Caches the result so subsequent calls return the cached content.
   * @returns git diff as string, or empty string if no .git directory or on error
   */
  public getDiffContent(): string {
    if (this.diffContent !== undefined) {
      return this.diffContent;
    }

    try {
      const command = 'git';
      const commandSwitch = ['diff', 'HEAD'];
      const diffIO = spawnSync(command, commandSwitch);

      if (diffIO.error) {
        Logger.warn('Failed to retrieve git diff: .git directory not found or git not available');
        this.diffContent = '';
        return '';
      }

      this.diffContent = diffIO.stdout.toString();
      return this.diffContent;
    } catch (error) {
      Logger.warn(`Error retrieving git diff: ${error instanceof Error ? error.message : String(error)}`);
      this.diffContent = '';
      return '';
    }
  }

  /**
   * Checks if a pattern exists in the git diff content.
   * @param pattern - string, RegExp, or array of strings to check
   * @param diffContent - the diff content to search in
   * @returns true if pattern is found in diff, false otherwise
   */
  public hasPatternInDiff(pattern: string | RegExp | string[], diffContent: string): boolean {
    if (!diffContent) {
      return false;
    }

    if (pattern instanceof RegExp) {
      return pattern.test(diffContent);
    }

    if (Array.isArray(pattern)) {
      return pattern.some((p) => diffContent.includes(p));
    }

    return diffContent.includes(pattern as string);
  }
}

import multimatch from 'multimatch';
import { existsSync } from 'node:fs';
import { readHeadOfFile } from '../helpers/file.js';
import { Logger } from '../helpers/logger.js';
import { hasPatternMatch } from '../helpers/patternMatcher.js';
import { type Rule, type ScanvaConfig } from '../validators/ConfigSchemas.js';
import { DiffProcessor } from './DiffProcessor.js';

export interface FlaggedFile {
  file: string;
  rule: Rule;
  errorLevel: string;
}

export interface RuleResult {
  rule: Rule;
  matchedFiles: string[];
  filesWithMatches: string[];
  flaggedFiles: FlaggedFile[];
}

export class RuleProcessor {
  private diffProcessor = new DiffProcessor();
  private cachedDiffContent: string | undefined;

  public async processRules(config: ScanvaConfig, files: string[]): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    // Cache diff content once for all rules
    try {
      this.cachedDiffContent = this.diffProcessor.getDiffContent();
    } catch (error) {
      Logger.warn(`Failed to retrieve git diff: ${error instanceof Error ? error.message : String(error)}`);
      this.cachedDiffContent = undefined;
    }

    for (const rule of config.rules) {
      const result = await this.processRule(rule, files);
      Logger.info(`Rule found matches in ${result.filesWithMatches.length} files: ${result.filesWithMatches.join(', ')}`);
      results.push(result);
    }

    return results;
  }

  private async processRule(rule: Rule, files: string[]): Promise<RuleResult> {
    const matchedFiles = this.getMatchingFiles(rule, files);
    const filesWithMatches = await this.findFilesWithPattern(rule, matchedFiles);
    const flaggedFiles: FlaggedFile[] = [];

    // Check if matched files have patterns in the diff
    if (this.cachedDiffContent !== undefined) {
      for (const file of filesWithMatches) {
        try {
          if (this.diffProcessor.hasPatternInDiff(rule.find || rule.pattern, this.cachedDiffContent)) {
            flaggedFiles.push({
              file,
              rule,
              errorLevel: rule.level,
            });
            Logger.info(`Flagged violation - File: ${file}, Rule: ${rule.pattern}, Error Level: ${rule.level}`);
          }
        } catch (error) {
          Logger.warn(`Error checking pattern for file ${file}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    return {
      rule,
      matchedFiles,
      filesWithMatches,
      flaggedFiles,
    };
  }

  private getMatchingFiles(rule: Rule, files: string[]): string[] {
    const matchedFiles = rule.files ? multimatch(files, rule.files) : files;
    // Filter out non-existent files
    return matchedFiles.filter((file) => existsSync(file));
  }

  private async findFilesWithPattern(rule: Rule, files: string[]): Promise<string[]> {
    // If no find pattern, include all files (already filtered for existence)
    if (!rule.find) {
      return files;
    }

    const filesWithMatches: string[] = [];

    for (const file of files) {
      try {
        const headContent = await readHeadOfFile(file, rule.head);

        if (hasPatternMatch(rule.find, headContent)) {
          filesWithMatches.push(file);
        }
      } catch {
        Logger.warn(`Could not read file: ${file}`);
      }
    }

    return filesWithMatches;
  }
}

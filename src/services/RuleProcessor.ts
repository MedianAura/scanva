import multimatch from 'multimatch';
import { existsSync } from 'node:fs';
import { readHeadOfFile } from '../helpers/file.js';
import { Logger } from '../helpers/logger.js';
import { type Rule, type ScanvaConfig } from '../validators/ConfigSchemas.js';

interface FlaggedFile {
  file: string;
  rule: Rule;
  errorLevel: string;
}

interface RuleResult {
  rule: Rule;
  matchedFiles: string[];
  filesWithMatches: string[];
  flaggedFiles: FlaggedFile[];
}

export class RuleProcessor {
  public async processRules(config: ScanvaConfig, files: string[]): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

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

    return {
      rule,
      matchedFiles,
      filesWithMatches,
      flaggedFiles: [],
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

        if (this.hasPatternMatch(rule, headContent)) {
          filesWithMatches.push(file);
        }
      } catch {
        Logger.warn(`Could not read file: ${file}`);
      }
    }

    return filesWithMatches;
  }

  private hasPatternMatch(rule: Rule, content: string): boolean {
    // This method assumes rule.find exists (caller should check)
    if (rule.find instanceof RegExp) {
      return rule.find.test(content);
    }

    if (Array.isArray(rule.find)) {
      return rule.find.some((pattern) => content.includes(pattern));
    }

    return content.includes(rule.find as string);
  }
}

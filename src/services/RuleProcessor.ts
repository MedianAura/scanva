import multimatch from 'multimatch';
import { existsSync } from 'node:fs';
import { readHeadOfFile } from '../helpers/file.js';
import { hasPatternMatch } from '../helpers/patternMatcher.js';
import { type Rule, type ScanvaConfig } from '../validators/ConfigSchemas.js';
import { DiffProcessor } from './DiffProcessor.js';
import { Reporter } from './Reporter.js';

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
  private diffProcessor: DiffProcessor;
  private cachedDiffContent: string | undefined;
  private reporter: Reporter;
  private commitHash: string;

  public constructor(reporter: Reporter, commitHash: string = 'HEAD', diffProcessor?: DiffProcessor) {
    this.reporter = reporter;
    this.commitHash = commitHash;
    this.diffProcessor = diffProcessor ?? new DiffProcessor();
  }

  public async processRules(config: ScanvaConfig, files: string[]): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    // Cache diff content once for all rules
    // Error propagates if getDiffContent fails
    this.cachedDiffContent = this.diffProcessor.getDiffContent(this.commitHash);

    for (const rule of config.rules) {
      const result = await this.processRule(rule, files);
      this.reporter.onRuleProcessed(rule);
      results.push(result);
    }

    return results;
  }

  private async processRule(rule: Rule, files: string[]): Promise<RuleResult> {
    const matchedFiles = this.getMatchingFiles(rule, files);
    const filesWithMatches = await this.findFilesWithPattern(rule, matchedFiles);
    const flaggedFiles: FlaggedFile[] = [];

    // Check if matched files have patterns in the diff
    for (const file of filesWithMatches) {
      this.reporter.onFileMatched(file);
      if (this.diffProcessor.hasPatternInDiff(rule.find || rule.pattern, this.cachedDiffContent!)) {
        flaggedFiles.push({
          file,
          rule,
          errorLevel: rule.level,
        });
        this.reporter.onViolation(file, rule, rule.level);
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
      // Errors from readHeadOfFile propagate to caller
      const headContent = await readHeadOfFile(file, rule.head);

      // Errors from hasPatternMatch propagate to caller
      if (hasPatternMatch(rule.find, headContent)) {
        filesWithMatches.push(file);
      }
    }

    return filesWithMatches;
  }
}

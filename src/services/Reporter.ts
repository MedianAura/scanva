import chalk from 'chalk';
import path from 'node:path';
import { Level } from '../enums/Level.js';
import { getGitRoot } from '../helpers/git.js';
import { Logger } from '../helpers/logger.js';
import { type Rule } from '../validators/ConfigSchemas.js';

export interface ReportEvent {
  rule: Rule;
  file: string;
  level: Level;
}

export class Reporter {
  private rules: Set<string> = new Set();
  private fileMatches: Set<string> = new Set();
  private violations: ReportEvent[] = [];

  public onRuleProcessed(rule: Rule): void {
    this.rules.add(rule.pattern);
  }

  public onFileMatched(file: string): void {
    this.fileMatches.add(file);
  }

  public onViolation(file: string, rule: Rule, level: Level): void {
    this.violations.push({ rule, file, level });
  }

  public report(): boolean {
    if (this.violations.length === 0) {
      Logger.success('No violations found!');
      return false;
    }

    // Group violations by file
    const violationsByFile = new Map<string, ReportEvent[]>();
    for (const violation of this.violations) {
      const existing = violationsByFile.get(violation.file) || [];
      existing.push(violation);
      violationsByFile.set(violation.file, existing);
    }

    // Display violations grouped by file
    const gitRoot = getGitRoot();
    for (const [file, fileViolations] of violationsByFile) {
      const relativePath = path.relative(gitRoot, file);
      Logger.println(chalk.underline(relativePath));
      for (const violation of fileViolations) {
        const indicator = violation.level === Level.Error ? chalk.red('✕') : chalk.yellow('△');
        const message = violation.rule.pattern;
        const ruleId = chalk.dim(violation.rule.pattern);
        Logger.println(`${indicator}  ${message.padEnd(40)} ${ruleId}`);
      }
      Logger.skipLine();
    }

    // Display summary footer with violation counts
    const errorCount = this.violations.filter((v) => v.level === Level.Error).length;
    const warningCount = this.violations.filter((v) => v.level === Level.Warning).length;

    const errorText = chalk.red(`${errorCount} error${errorCount === 1 ? '' : 's'}`);
    const warningText = chalk.yellow(`${warningCount} warning${warningCount === 1 ? '' : 's'}`);
    Logger.println(`${errorText}`);
    Logger.println(`${warningText}`);

    // Return true if there are errors (for exit code)
    return errorCount > 0;
  }
}

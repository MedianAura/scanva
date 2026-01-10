import { Level } from '../enums/Level.js';
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

  public report(): void {
    if (this.violations.length === 0) {
      Logger.success('No violations found!');
      return;
    }

    Logger.skipLine();
    Logger.println(`Total violations: ${this.violations.length}`);
    Logger.skipLine();

    // Group violations by error level
    const violationsByLevel: Record<Level, ReportEvent[]> = {} as Record<Level, ReportEvent[]>;
    for (const violation of this.violations) {
      if (!violationsByLevel[violation.level]) {
        violationsByLevel[violation.level] = [];
      }
      violationsByLevel[violation.level]!.push(violation);
    }

    // Output violations grouped by level
    const levelOrder = [Level.Error, Level.Warning, Level.Info];
    for (const level of levelOrder) {
      const violations = violationsByLevel[level];
      if (violations) {
        Logger.println(`${level.toUpperCase()}: ${violations.length}`);
        for (const violation of violations) {
          Logger.println(`  - ${violation.file}`);
        }
        Logger.skipLine();
      }
    }

    // List flagged files
    const flaggedFiles = [...this.fileMatches].toSorted();
    Logger.println(`Flagged files: ${flaggedFiles.length}`);
    for (const file of flaggedFiles) {
      Logger.println(`  - ${file}`);
    }
  }
}

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
  }
}

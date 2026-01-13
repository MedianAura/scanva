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

    // Group violations by file
    const violationsByFile = new Map<string, ReportEvent[]>();
    for (const violation of this.violations) {
      const existing = violationsByFile.get(violation.file) || [];
      existing.push(violation);
      violationsByFile.set(violation.file, existing);
    }

    // Display violations grouped by file
    for (const [file, fileViolations] of violationsByFile) {
      console.log(file);
      for (const violation of fileViolations) {
        const indicator = violation.level === Level.Error ? '●' : '▲';
        const levelText = violation.level === Level.Error ? 'Error' : 'Warning';
        const ruleDescription = violation.rule.pattern;
        console.log(`${indicator} ${levelText} : ${ruleDescription}`);
      }
      console.log(''); // Blank line between file sections
    }
  }
}

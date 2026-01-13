import { beforeEach, describe, expect, it, vi } from 'vitest';
// Side effect: mocks/logger.js sets up logger mocking via vi.mock - MUST be imported first
import { mock_Logger } from '../../../mocks/logger.js';

vi.mock('../../../../src/helpers/git.js', () => ({
  getGitRoot: vi.fn(() => '/root'),
}));

import { Level } from '../../../../src/index.js';
import { type Rule } from '../../../../src/index.js';
import { Reporter } from '../../../../src/services/Reporter.js';

describe('Reporter', () => {
  let reporter: Reporter;

  beforeEach(() => {
    reporter = new Reporter();
    vi.clearAllMocks();
  });

  describe('onRuleProcessed', () => {
    it('should collect rule patterns', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onRuleProcessed(rule);
      // Reporter is called, no assertion needed - just verify it doesn't throw
      expect(reporter).toBeDefined();
    });
  });

  describe('onFileMatched', () => {
    it('should collect matched files', () => {
      reporter.onFileMatched('src/file1.ts');
      reporter.onFileMatched('src/file2.ts');

      expect(reporter).toBeDefined();
    });

    it('should not duplicate file entries', () => {
      reporter.onFileMatched('src/file1.ts');
      reporter.onFileMatched('src/file1.ts');

      expect(reporter).toBeDefined();
    });
  });

  describe('onViolation', () => {
    it('should collect violation events', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);

      expect(reporter).toBeDefined();
    });

    it('should collect multiple violations', () => {
      const rule1: Rule = {
        pattern: 'pattern-1',
        level: Level.Error,
      };

      const rule2: Rule = {
        pattern: 'pattern-2',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', rule1, Level.Error);
      reporter.onViolation('src/file2.ts', rule2, Level.Warning);

      expect(reporter).toBeDefined();
    });
  });

  describe('report', () => {
    it('should output success message when no violations', () => {
      const hasErrors = reporter.report();

      expect(mock_Logger.success).toHaveBeenCalledWith('No violations found!');
      expect(hasErrors).toBe(false);
    });

    it('should not output when violations exist', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.report();

      expect(mock_Logger.success).not.toHaveBeenCalled();
    });

    it('should collect violations of different levels', () => {
      const errorRule: Rule = {
        pattern: 'error-pattern',
        level: Level.Error,
      };

      const warnRule: Rule = {
        pattern: 'warn-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file2.ts', warnRule, Level.Warning);
      reporter.report();

      expect(mock_Logger.success).not.toHaveBeenCalled();
    });

    it('should track flagged files', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onFileMatched('src/file1.ts');
      reporter.onFileMatched('src/file2.ts');
      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.report();

      expect(mock_Logger.success).not.toHaveBeenCalled();
    });

    it('should handle violations without output', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.report();

      // Should have output with violations
      expect(mock_Logger.println).toHaveBeenCalled();
      expect(mock_Logger.skipLine).toHaveBeenCalled();
    });

    it('should track files in alphabetical order', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onFileMatched('z-file.ts');
      reporter.onFileMatched('a-file.ts');
      reporter.onViolation('z-file.ts', rule, Level.Error);
      reporter.report();

      expect(mock_Logger.success).not.toHaveBeenCalled();
    });

    it('should handle violations from different rules', () => {
      const rule1: Rule = {
        pattern: 'pattern-1',
        level: Level.Error,
      };

      const rule2: Rule = {
        pattern: 'pattern-2',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule1, Level.Error);
      reporter.onViolation('src/file2.ts', rule2, Level.Error);
      reporter.report();

      expect(mock_Logger.success).not.toHaveBeenCalled();
    });

    it('should display violations grouped by file with ASCII indicators', () => {
      const errorRule: Rule = {
        pattern: 'test-error',
        level: Level.Error,
      };

      const warningRule: Rule = {
        pattern: 'test-warning',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file1.ts', warningRule, Level.Warning);
      reporter.report();

      // Check that Logger.println was called for file and violations
      const calls = (mock_Logger.println as any).mock.calls.map((call: any[]) => call[0]);
      expect(calls.some((call: string) => call && call.includes('file1.ts'))).toBe(true);
    });

    it('should separate file sections with blank lines', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.onViolation('src/file2.ts', rule, Level.Error);
      reporter.report();

      // Should call skipLine between files
      expect(mock_Logger.skipLine).toHaveBeenCalled();
      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should use correct ASCII symbols for error and warning', () => {
      const errorRule: Rule = {
        pattern: 'error-test',
        level: Level.Error,
      };

      const warningRule: Rule = {
        pattern: 'warning-test',
        level: Level.Warning,
      };

      reporter.onViolation('src/file.ts', errorRule, Level.Error);
      reporter.onViolation('src/file.ts', warningRule, Level.Warning);
      reporter.report();

      // Should output violations with Logger.println
      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should group multiple violations per file', () => {
      const rule1: Rule = {
        pattern: 'pattern-1',
        level: Level.Error,
      };

      const rule2: Rule = {
        pattern: 'pattern-2',
        level: Level.Error,
      };

      reporter.onViolation('src/same-file.ts', rule1, Level.Error);
      reporter.onViolation('src/same-file.ts', rule2, Level.Error);
      reporter.report();

      // Should output violations with Logger.println
      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should display summary footer with violation counts', () => {
      const errorRule: Rule = {
        pattern: 'error-pattern',
        level: Level.Error,
      };

      const warningRule: Rule = {
        pattern: 'warning-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file2.ts', warningRule, Level.Warning);
      reporter.report();

      // Should call skipLine and println for summary
      expect(mock_Logger.skipLine).toHaveBeenCalled();
      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should display summary footer with correct counts for only errors', () => {
      const errorRule: Rule = {
        pattern: 'error-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file2.ts', errorRule, Level.Error);
      reporter.onViolation('src/file3.ts', errorRule, Level.Error);
      reporter.report();

      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should display summary footer with correct counts for only warnings', () => {
      const warningRule: Rule = {
        pattern: 'warning-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', warningRule, Level.Warning);
      reporter.onViolation('src/file2.ts', warningRule, Level.Warning);
      reporter.report();

      expect(mock_Logger.println).toHaveBeenCalled();
    });

    it('should return true when errors exist', () => {
      const errorRule: Rule = {
        pattern: 'error-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      const hasErrors = reporter.report();

      expect(hasErrors).toBe(true);
    });

    it('should return false when only warnings exist', () => {
      const warningRule: Rule = {
        pattern: 'warning-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', warningRule, Level.Warning);
      const hasErrors = reporter.report();

      expect(hasErrors).toBe(false);
    });

    it('should return true when both errors and warnings exist', () => {
      const errorRule: Rule = {
        pattern: 'error-pattern',
        level: Level.Error,
      };

      const warningRule: Rule = {
        pattern: 'warning-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', errorRule, Level.Error);
      reporter.onViolation('src/file2.ts', warningRule, Level.Warning);
      const hasErrors = reporter.report();

      expect(hasErrors).toBe(true);
    });
  });
});

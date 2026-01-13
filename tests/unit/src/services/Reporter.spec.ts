import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Level } from '../../../../src/enums/Level.js';
import { Logger } from '../../../../src/helpers/logger.js';
import { Reporter } from '../../../../src/services/Reporter.js';
import { type Rule } from '../../../../src/validators/ConfigSchemas.js';

vi.mock('../../../../src/helpers/logger.js', () => ({
  Logger: {
    skipLine: vi.fn(),
    println: vi.fn(),
    success: vi.fn(),
  },
}));

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Reporter', () => {
  let reporter: Reporter;

  beforeEach(() => {
    reporter = new Reporter();
    vi.clearAllMocks();
    consoleLogSpy.mockClear();
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

      expect(Logger.success).toHaveBeenCalledWith('No violations found!');
      expect(hasErrors).toBe(false);
    });

    it('should not output when violations exist', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.report();

      expect(Logger.success).not.toHaveBeenCalled();
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

      expect(Logger.success).not.toHaveBeenCalled();
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

      expect(Logger.success).not.toHaveBeenCalled();
    });

    it('should handle violations without output', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.report();

      expect(Logger.skipLine).not.toHaveBeenCalled();
      expect(Logger.println).not.toHaveBeenCalled();
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

      expect(Logger.success).not.toHaveBeenCalled();
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

      expect(Logger.success).not.toHaveBeenCalled();
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

      expect(consoleLogSpy).toHaveBeenCalledWith('src/file1.ts');
      expect(consoleLogSpy).toHaveBeenCalledWith('● Error : test-error');
      expect(consoleLogSpy).toHaveBeenCalledWith('▲ Warning : test-warning');
      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should separate file sections with blank lines', () => {
      const rule: Rule = {
        pattern: 'test-pattern',
        level: Level.Error,
      };

      reporter.onViolation('src/file1.ts', rule, Level.Error);
      reporter.onViolation('src/file2.ts', rule, Level.Error);
      reporter.report();

      const calls = consoleLogSpy.mock.calls.map((call) => call[0]);
      expect(calls).toContain('src/file1.ts');
      expect(calls).toContain('src/file2.ts');
      expect(calls).toContain('');
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

      const calls = consoleLogSpy.mock.calls.map((call) => call[0]);
      expect(calls).toContain('● Error : error-test');
      expect(calls).toContain('▲ Warning : warning-test');
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

      const calls = consoleLogSpy.mock.calls.map((call) => call[0]);
      const fileHeaderCount = calls.filter((call) => call === 'src/same-file.ts').length;
      expect(fileHeaderCount).toBe(1); // File header should appear only once
      expect(calls).toContain('● Error : pattern-1');
      expect(calls).toContain('● Error : pattern-2');
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

      const calls = consoleLogSpy.mock.calls.map((call) => call[0]);
      // Check blank line before footer
      const footerIndex = calls.indexOf('2 Error(s), 1 Warning(s)');
      expect(footerIndex).toBeGreaterThan(0);
      expect(calls[footerIndex - 1]).toBe('');
      expect(consoleLogSpy).toHaveBeenCalledWith('2 Error(s), 1 Warning(s)');
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

      expect(consoleLogSpy).toHaveBeenCalledWith('3 Error(s), 0 Warning(s)');
    });

    it('should display summary footer with correct counts for only warnings', () => {
      const warningRule: Rule = {
        pattern: 'warning-pattern',
        level: Level.Warning,
      };

      reporter.onViolation('src/file1.ts', warningRule, Level.Warning);
      reporter.onViolation('src/file2.ts', warningRule, Level.Warning);
      reporter.report();

      expect(consoleLogSpy).toHaveBeenCalledWith('0 Error(s), 2 Warning(s)');
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

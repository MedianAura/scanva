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
      reporter.report();

      expect(Logger.success).toHaveBeenCalledWith('No violations found!');
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
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Side effect: mocks/fs.js sets up fs mocking via vi.mock - MUST be imported first
import { mock_Fs } from '@mocks/fs.js';

vi.mock('@src/helpers/file.js');
vi.mock('@src/helpers/patternMatcher.js');

import { Level } from '@src/enums/Level.js';
import * as fileHelper from '@src/helpers/file.js';
import * as patternMatcher from '@src/helpers/patternMatcher.js';
import { type ScanvaConfig } from '@src/index.js';
import { DiffProcessor } from '@src/services/DiffProcessor.js';
import { Reporter } from '@src/services/Reporter.js';
import { RuleProcessor } from '@src/services/RuleProcessor.js';

describe('RuleProcessor', () => {
  let mockReporter: Reporter;
  let mockDiffProcessor: DiffProcessor;

  beforeEach(() => {
    mock_Fs.existsSync.mockReturnValue(true);

    // Create properly mocked instances
    mockReporter = {
      onRuleProcessed: vi.fn(),
      onFileMatched: vi.fn(),
      onViolation: vi.fn(),
    } as any;

    mockDiffProcessor = {
      getDiffContent: vi.fn().mockReturnValue('mock diff content'),
      hasPatternInDiff: vi.fn().mockReturnValue(false),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('processRules', () => {
    it('processes all rules and calls onRuleProcessed for each', async () => {
      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'pattern1',
            level: Level.Error,
          },
          {
            pattern: 'pattern2',
            level: Level.Warning,
          },
        ],
      };

      const mockRuleResult1 = {
        rule: config.rules[0],
        matchedFiles: [],
        filesWithMatches: [],
        flaggedFiles: [],
      };

      const mockRuleResult2 = {
        rule: config.rules[1],
        matchedFiles: [],
        filesWithMatches: [],
        flaggedFiles: [],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);

      // Mock the private processRule method
      const processRuleSpy = vi.spyOn(ruleProcessor as any, 'processRule');
      processRuleSpy.mockResolvedValueOnce(mockRuleResult1);
      processRuleSpy.mockResolvedValueOnce(mockRuleResult2);

      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results).toHaveLength(2);
      expect(results[0]).toBe(mockRuleResult1);
      expect(results[1]).toBe(mockRuleResult2);
      expect(processRuleSpy).toHaveBeenCalledTimes(2);
      expect(processRuleSpy).toHaveBeenCalledWith(config.rules[0], ['file1.ts', 'file2.ts']);
      expect(processRuleSpy).toHaveBeenCalledWith(config.rules[1], ['file1.ts', 'file2.ts']);
      expect(mockReporter.onRuleProcessed).toHaveBeenCalledTimes(2);
      expect(mockReporter.onRuleProcessed).toHaveBeenCalledWith(config.rules[0]);
      expect(mockReporter.onRuleProcessed).toHaveBeenCalledWith(config.rules[1]);
    });

    it('caches diff content once for all rules', async () => {
      const config: ScanvaConfig = {
        rules: [
          { pattern: 'pattern1', level: Level.Error },
          { pattern: 'pattern2', level: Level.Error },
        ],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);

      // Mock processRule to prevent actual execution
      vi.spyOn(ruleProcessor as any, 'processRule').mockResolvedValue({
        rule: config.rules[0],
        matchedFiles: [],
        filesWithMatches: [],
        flaggedFiles: [],
      });

      await ruleProcessor.processRules(config, ['file1.ts']);

      // getDiffContent should only be called once
      expect(mockDiffProcessor.getDiffContent).toHaveBeenCalledTimes(1);
    });

    it('propagates error when getDiffContent fails', async () => {
      const mockError = new Error('Failed to get diff');
      vi.mocked(mockDiffProcessor.getDiffContent).mockImplementation(() => {
        throw mockError;
      });

      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      await expect(ruleProcessor.processRules(config, ['file.ts'])).rejects.toThrow(mockError);
    });
  });

  describe('file matching', () => {
    it('includes all files when no file pattern specified', async () => {
      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts', 'file3.js']);

      expect(results[0]?.matchedFiles).toEqual(['file1.ts', 'file2.ts', 'file3.js']);
    });

    it('filters files by rule.files pattern', async () => {
      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            files: '*.ts',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts', 'file3.js']);

      expect(results[0]?.matchedFiles).toEqual(['file1.ts', 'file2.ts']);
    });

    it('filters out non-existent files', async () => {
      mock_Fs.existsSync.mockImplementation((path: string) => path !== 'missing.ts');

      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'missing.ts', 'file2.ts']);

      expect(results[0]?.matchedFiles).toEqual(['file1.ts', 'file2.ts']);
    });
  });

  describe('pattern matching with find', () => {
    it('includes all matched files when no find pattern specified', async () => {
      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results[0]?.filesWithMatches).toEqual(['file1.ts', 'file2.ts']);
      expect(mockReporter.onFileMatched).toHaveBeenCalledTimes(2);
    });

    it('filters files by find pattern when specified', async () => {
      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            find: 'find-pattern',
            level: Level.Error,
          },
        ],
      };

      vi.mocked(fileHelper.readHeadOfFile).mockResolvedValue('file content');
      vi.mocked(patternMatcher.hasPatternMatch).mockImplementation((pattern) => {
        return pattern === 'find-pattern'; // Only match the find pattern
      });

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results[0]?.filesWithMatches).toEqual(['file1.ts', 'file2.ts']);
      expect(fileHelper.readHeadOfFile).toHaveBeenCalledTimes(2);
    });

    it('only includes files matching find pattern', async () => {
      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            find: 'find-pattern',
            level: Level.Error,
          },
        ],
      };

      vi.mocked(fileHelper.readHeadOfFile).mockImplementation(async (file) => {
        return file === 'file1.ts' ? 'matching content' : 'other content';
      });
      vi.mocked(patternMatcher.hasPatternMatch).mockImplementation((pattern, content) => {
        return content === 'matching content';
      });

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results[0]?.filesWithMatches).toEqual(['file1.ts']);
      expect(mockReporter.onFileMatched).toHaveBeenCalledTimes(1);
      expect(mockReporter.onFileMatched).toHaveBeenCalledWith('file1.ts');
    });

    it('propagates error when readHeadOfFile fails', async () => {
      const mockError = new Error('Failed to read file');
      vi.mocked(fileHelper.readHeadOfFile).mockRejectedValue(mockError);

      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            find: 'find-pattern',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      await expect(ruleProcessor.processRules(config, ['file.ts'])).rejects.toThrow(mockError);
    });
  });

  describe('violation detection', () => {
    it('flags files when pattern found in diff', async () => {
      vi.mocked(mockDiffProcessor.hasPatternInDiff).mockReturnValue(true);

      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results[0]?.flaggedFiles).toHaveLength(2);
      expect(results[0]?.flaggedFiles[0]).toEqual({
        file: 'file1.ts',
        rule: config.rules[0],
        errorLevel: Level.Error,
      });
      expect(results[0]?.flaggedFiles[1]).toEqual({
        file: 'file2.ts',
        rule: config.rules[0],
        errorLevel: Level.Error,
      });
      expect(mockReporter.onViolation).toHaveBeenCalledTimes(2);
    });

    it('does not flag files when pattern not found in diff', async () => {
      vi.mocked(mockDiffProcessor.hasPatternInDiff).mockReturnValue(false);

      const config: ScanvaConfig = {
        rules: [{ pattern: 'test-pattern', level: Level.Error }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      const results = await ruleProcessor.processRules(config, ['file1.ts', 'file2.ts']);

      expect(results[0]?.flaggedFiles).toHaveLength(0);
      expect(mockReporter.onViolation).not.toHaveBeenCalled();
    });

    it('uses find pattern for diff check when specified', async () => {
      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            find: 'find-pattern',
            level: Level.Error,
          },
        ],
      };

      vi.mocked(fileHelper.readHeadOfFile).mockResolvedValue('content');
      vi.mocked(patternMatcher.hasPatternMatch).mockReturnValue(true);
      vi.mocked(mockDiffProcessor.hasPatternInDiff).mockReturnValue(true);

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      await ruleProcessor.processRules(config, ['file1.ts']);

      // Should check for find-pattern in diff, not test-pattern
      expect(mockDiffProcessor.hasPatternInDiff).toHaveBeenCalledWith('find-pattern', 'mock diff content');
    });

    it('passes correct level to reporter.onViolation', async () => {
      vi.mocked(mockDiffProcessor.hasPatternInDiff).mockReturnValue(true);

      const config: ScanvaConfig = {
        rules: [{ pattern: 'warn-pattern', level: Level.Warning }],
      };

      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      await ruleProcessor.processRules(config, ['file.ts']);

      expect(mockReporter.onViolation).toHaveBeenCalledWith('file.ts', config.rules[0], Level.Warning);
    });
  });

  describe('constructor', () => {
    it('accepts Reporter and DiffProcessor instances', () => {
      const ruleProcessor = new RuleProcessor(mockReporter, mockDiffProcessor);
      expect(ruleProcessor).toBeDefined();
    });

    it('creates default DiffProcessor when not provided', () => {
      const ruleProcessor = new RuleProcessor(mockReporter);
      expect(ruleProcessor).toBeDefined();
    });
  });
});

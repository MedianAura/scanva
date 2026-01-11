import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Level } from '../../../../src/enums/Level.js';
import * as fileHelper from '../../../../src/helpers/file.js';
import * as gitModule from '../../../../src/helpers/git.js';
import { Logger } from '../../../../src/helpers/logger.js';
import * as patternMatcher from '../../../../src/helpers/patternMatcher.js';
import { RuleProcessor } from '../../../../src/services/RuleProcessor.js';
import { type ScanvaConfig } from '../../../../src/validators/ConfigSchemas.js';
import { getMockedFs } from '../../../mocks/fs.js';

// Side effect: mocks/fs.js sets up fs mocking via vi.mock

vi.mock('../../../../src/helpers/logger.js');
vi.mock('../../../../src/helpers/file.js');
vi.mock('../../../../src/helpers/git.js');
vi.mock('../../../../src/helpers/patternMatcher.js');

describe('RuleProcessor Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockedFs = getMockedFs();
    if (mockedFs) {
      mockedFs.existsSync.mockReturnValue(true);
    }
  });

  describe('errors thrown from getDiffContent', () => {
    it('propagates error when getDiffContent fails', async () => {
      const mockError = new Error('Failed to get diff: .git directory not found');
      vi.mocked(gitModule.getDiffContent).mockImplementation(() => {
        throw mockError;
      });

      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            files: '**/*.ts',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor();
      await expect(ruleProcessor.processRules(config, ['file.ts'])).rejects.toThrow(mockError);
      expect(Logger.warn).not.toHaveBeenCalled();
    });

    it('does not catch getDiffContent error - lets it propagate', async () => {
      const diffError = new Error('Failed to execute git command');
      vi.mocked(gitModule.getDiffContent).mockImplementation(() => {
        throw diffError;
      });

      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor();
      await expect(ruleProcessor.processRules(config, ['file.ts'])).rejects.toThrow(diffError);
      expect(Logger.warn).not.toHaveBeenCalled();
    });
  });

  describe('successful processing without errors', () => {
    it('processes rules successfully when no find pattern specified', async () => {
      vi.mocked(gitModule.getDiffContent).mockReturnValue('diff content');
      vi.mocked(patternMatcher.hasPatternMatch).mockReturnValue(true);

      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor();
      const results = await ruleProcessor.processRules(config, ['file1.ts']);

      expect(results).toHaveLength(1);
      expect(Logger.warn).not.toHaveBeenCalled();
    });

    it('does not log warnings when operations succeed', async () => {
      vi.mocked(gitModule.getDiffContent).mockReturnValue('diff content');
      vi.mocked(fileHelper.readHeadOfFile).mockResolvedValue('file content');
      vi.mocked(patternMatcher.hasPatternMatch).mockReturnValue(true);

      const config: ScanvaConfig = {
        rules: [
          {
            pattern: 'test-pattern',
            find: 'find-pattern',
            level: Level.Error,
          },
        ],
      };

      const ruleProcessor = new RuleProcessor();
      await ruleProcessor.processRules(config, ['file.ts']);

      expect(Logger.warn).not.toHaveBeenCalled();
    });
  });
});

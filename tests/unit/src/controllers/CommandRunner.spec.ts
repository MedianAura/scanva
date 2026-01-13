import '@mocks/fs.js';

vi.mock('@src/helpers/git.js', () => ({
  getFilesFromCommit: vi.fn(),
  getDiffContent: vi.fn(),
}));

vi.mock('@src/helpers/logger.js', () => ({
  Logger: {
    clear: vi.fn(),
    title: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    print: vi.fn(),
    println: vi.fn(),
    skipLine: vi.fn(),
  },
}));

vi.mock('@src/services/Reporter.js');

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandRunner } from '@src/controllers/CommandRunner.js';
import { Level } from '@src/enums/Level.js';
import * as git from '@src/helpers/git.js';
import { ConfigurationNotFoundError } from '@src/models/Errors.js';
import { Reporter } from '@src/services/Reporter.js';

describe('CommandRunner', () => {
  let commandRunner: CommandRunner;

  beforeEach(() => {
    vi.clearAllMocks();
    commandRunner = new CommandRunner();
  });

  describe('Reporter Integration', () => {
    it('should call reporter.report() after processing rules', async () => {
      // Mock config search to return valid config
      const mockConfig = {
        rules: [
          {
            pattern: 'test-rule',
            level: Level.Error,
            find: 'test',
            files: '**/*.ts',
          },
        ],
      };

      vi.spyOn(commandRunner as any, 'getConfig').mockResolvedValue({
        config: mockConfig,
        filepath: 'scanva.config.ts',
      });

      vi.mocked(git.getFilesFromCommit).mockReturnValue(['file1.ts']);

      // Create a spy on Reporter.prototype.report
      const reportSpy = vi.spyOn(Reporter.prototype, 'report');

      await commandRunner.run('HEAD');

      // Verify reporter.report() was called
      expect(reportSpy).toHaveBeenCalledOnce();
    });

    it('should throw error if config not found', async () => {
      // eslint-disable-next-line unicorn/no-null
      vi.spyOn(commandRunner as any, 'getConfig').mockResolvedValue(null);

      await expect(commandRunner.run('HEAD')).rejects.toThrow(ConfigurationNotFoundError);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate getDiffContent errors to caller', async () => {
      const mockConfig = {
        rules: [
          {
            pattern: 'test-rule',
            level: Level.Error,
            find: 'test',
            files: '**/*.ts',
          },
        ],
      };

      vi.spyOn(commandRunner as any, 'getConfig').mockResolvedValue({
        config: mockConfig,
        filepath: 'scanva.config.ts',
      });

      vi.mocked(git.getFilesFromCommit).mockReturnValue(['file1.ts']);

      // Mock getDiffContent to throw error
      vi.mocked(git.getDiffContent).mockImplementation(() => {
        throw new Error('Git repository not found');
      });

      // Verify error propagates
      await expect(commandRunner.run('HEAD')).rejects.toThrow('Git repository not found');
    });
  });

  describe('Exit Code Behavior', () => {
    it('should allow error to propagate for exit code handling in main.ts', async () => {
      // eslint-disable-next-line unicorn/no-null
      vi.spyOn(commandRunner as any, 'getConfig').mockResolvedValue(null);

      // Verify error is thrown (not caught)
      await expect(commandRunner.run('HEAD')).rejects.toThrow(ConfigurationNotFoundError);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as gitModule from '../../../../src/helpers/git.js';
import { DiffProcessor } from '../../../../src/services/DiffProcessor.js';

vi.mock('../../../../src/helpers/git.js');

describe('DiffProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDiffContent', () => {
    it('should retrieve diff content from git helper on first call', () => {
      const mockDiff = 'diff --git a/file.ts b/file.ts\n+new content';
      vi.mocked(gitModule.getDiffContent).mockReturnValue(mockDiff);

      const processor = new DiffProcessor();
      const result = processor.getDiffContent();

      expect(result).toBe(mockDiff);
      expect(gitModule.getDiffContent).toHaveBeenCalledWith('HEAD');
    });

    it('should return cached content on subsequent calls', () => {
      const mockDiff = 'diff content';
      vi.mocked(gitModule.getDiffContent).mockReturnValue(mockDiff);

      const processor = new DiffProcessor();
      processor.getDiffContent();
      processor.getDiffContent();
      processor.getDiffContent();

      expect(gitModule.getDiffContent).toHaveBeenCalledTimes(1);
    });

    it('should accept custom commit reference', () => {
      const mockDiff = 'custom diff';
      vi.mocked(gitModule.getDiffContent).mockReturnValue(mockDiff);

      const processor = new DiffProcessor();
      processor.getDiffContent('main');

      expect(gitModule.getDiffContent).toHaveBeenCalledWith('main');
    });

    it('should throw error if git fails', () => {
      const mockError = new Error('Failed to retrieve git diff: .git directory not found or git not available');
      vi.mocked(gitModule.getDiffContent).mockImplementation(() => {
        throw mockError;
      });

      const processor = new DiffProcessor();

      expect(() => processor.getDiffContent()).toThrow(mockError);
    });

    it('should throw error if git command fails with status', () => {
      const mockError = new Error('Git command failed with status 128');
      vi.mocked(gitModule.getDiffContent).mockImplementation(() => {
        throw mockError;
      });

      const processor = new DiffProcessor();

      expect(() => processor.getDiffContent()).toThrow(mockError);
    });
  });

  describe('hasPatternInDiff', () => {
    it('should find string pattern in diff content', () => {
      const mockDiff = 'diff --git a/file.ts\n+console.log("test")\n-removed line';
      vi.mocked(gitModule.getDiffContent).mockReturnValue(mockDiff);

      const processor = new DiffProcessor();
      const hasPattern = processor.hasPatternInDiff('console.log', mockDiff);

      expect(hasPattern).toBe(true);
    });

    it('should return false for string pattern not in diff', () => {
      const mockDiff = 'diff content without pattern';

      const processor = new DiffProcessor();
      const hasPattern = processor.hasPatternInDiff('console.log', mockDiff);

      expect(hasPattern).toBe(false);
    });

    it('should find RegExp pattern in diff', () => {
      const mockDiff = 'added: +const x = 5;';

      const processor = new DiffProcessor();
      const hasPattern = processor.hasPatternInDiff(/\+const/, mockDiff);

      expect(hasPattern).toBe(true);
    });

    it('should find array pattern in diff', () => {
      const mockDiff = 'diff content with import statement';

      const processor = new DiffProcessor();
      const hasPattern = processor.hasPatternInDiff(['import', 'require'], mockDiff);

      expect(hasPattern).toBe(true);
    });

    it('should return false for empty diff', () => {
      const processor = new DiffProcessor();
      const hasPattern = processor.hasPatternInDiff('pattern', '');

      expect(hasPattern).toBe(false);
    });
  });
});

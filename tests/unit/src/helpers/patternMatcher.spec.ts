import { describe, expect, it } from 'vitest';
import { hasPatternMatch } from '../../../../src/helpers/patternMatcher.js';

describe('hasPatternMatch', () => {
  describe('String pattern matching', () => {
    it('should return true when string pattern exists in content', () => {
      const result = hasPatternMatch('hello', 'hello world');
      expect(result).toBe(true);
    });

    it('should return false when string pattern does not exist in content', () => {
      const result = hasPatternMatch('goodbye', 'hello world');
      expect(result).toBe(false);
    });

    it('should be case-sensitive for string patterns', () => {
      const result = hasPatternMatch('Hello', 'hello world');
      expect(result).toBe(false);
    });

    it('should match partial strings', () => {
      const result = hasPatternMatch('world', 'hello world');
      expect(result).toBe(true);
    });

    it('should handle special characters in string patterns', () => {
      const result = hasPatternMatch('hello.world', 'hello.world test');
      expect(result).toBe(true);
    });
  });

  describe('RegExp pattern matching', () => {
    it('should return true when RegExp pattern matches content', () => {
      const result = hasPatternMatch(/hello/, 'hello world');
      expect(result).toBe(true);
    });

    it('should return false when RegExp pattern does not match content', () => {
      const result = hasPatternMatch(/goodbye/, 'hello world');
      expect(result).toBe(false);
    });

    it('should respect RegExp flags (case-insensitive)', () => {
      const result = hasPatternMatch(/hello/i, 'HELLO world');
      expect(result).toBe(true);
    });

    it('should support complex RegExp patterns', () => {
      const result = hasPatternMatch(/^hello/, 'hello world');
      expect(result).toBe(true);
    });

    it('should return false for complex patterns that do not match', () => {
      const result = hasPatternMatch(/^world/, 'hello world');
      expect(result).toBe(false);
    });

    it('should match multiline patterns with m flag', () => {
      const multilineContent = 'line1\nline2\nline3';
      const result = hasPatternMatch(/^line2/m, multilineContent);
      expect(result).toBe(true);
    });
  });

  describe('Array of strings pattern matching', () => {
    it('should return true when any array pattern exists in content', () => {
      const result = hasPatternMatch(['hello', 'goodbye', 'bye'], 'hello world');
      expect(result).toBe(true);
    });

    it('should return true when second array pattern exists in content', () => {
      const result = hasPatternMatch(['hello', 'goodbye', 'world'], 'goodbye friend');
      expect(result).toBe(true);
    });

    it('should return false when no array patterns exist in content', () => {
      const result = hasPatternMatch(['hello', 'goodbye', 'bye'], 'see you later');
      expect(result).toBe(false);
    });

    it('should handle empty array pattern', () => {
      const result = hasPatternMatch([], 'hello world');
      expect(result).toBe(false);
    });

    it('should handle single element array', () => {
      const result = hasPatternMatch(['hello'], 'hello world');
      expect(result).toBe(true);
    });

    it('should be case-sensitive for array patterns', () => {
      const result = hasPatternMatch(['Hello', 'Goodbye'], 'hello world');
      expect(result).toBe(false);
    });

    it('should match partial strings in array', () => {
      const result = hasPatternMatch(['wor', 'bye'], 'hello world');
      expect(result).toBe(true);
    });
  });

  describe('Edge cases and empty content', () => {
    it('should return false when content is empty string', () => {
      const result = hasPatternMatch('hello', '');
      expect(result).toBe(false);
    });

    it('should return false with RegExp when content is empty', () => {
      const result = hasPatternMatch(/hello/, '');
      expect(result).toBe(false);
    });

    it('should return false with array when content is empty', () => {
      const result = hasPatternMatch(['hello', 'world'], '');
      expect(result).toBe(false);
    });

    it('should match empty string pattern in non-empty content', () => {
      const result = hasPatternMatch('', 'hello world');
      expect(result).toBe(true);
    });

    it('should handle whitespace content correctly', () => {
      const result = hasPatternMatch('test', '  test  ');
      expect(result).toBe(true);
    });

    it('should handle newlines in content', () => {
      const result = hasPatternMatch('test', 'hello\ntest\nworld');
      expect(result).toBe(true);
    });
  });

  describe('Integration tests combining multiple pattern types', () => {
    const testContent = `
import { foo } from 'bar';
export const result = foo + bar;
console.log(result);
`.trim();

    it('should find string pattern in multiline content', () => {
      const result = hasPatternMatch('export const', testContent);
      expect(result).toBe(true);
    });

    it('should find RegExp pattern in multiline content', () => {
      const result = hasPatternMatch(/console\.log/, testContent);
      expect(result).toBe(true);
    });

    it('should find array pattern in multiline content', () => {
      const result = hasPatternMatch(['import {', 'export const', 'console.log'], testContent);
      expect(result).toBe(true);
    });

    it('should handle realistic code patterns', () => {
      // Test string patterns
      expect(hasPatternMatch('debugger', testContent)).toBe(false);
      expect(hasPatternMatch('console.log', testContent)).toBe(true);
      expect(hasPatternMatch('console.error', testContent)).toBe(false);

      // Test RegExp pattern
      expect(hasPatternMatch(/console\.\w+/, testContent)).toBe(true);

      // Test array patterns
      expect(hasPatternMatch(['debugger', 'console.log', 'console.error'], testContent)).toBe(true);
    });
  });
});

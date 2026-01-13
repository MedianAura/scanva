import { type Mock, vi } from 'vitest';

// Define mock functions first
const mockPrint = vi.fn();
const mockPrintln = vi.fn();
const mockSkipLine = vi.fn();
const mockClear = vi.fn();
const mockTitle = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockWarn = vi.fn();
const mockInfo = vi.fn();
const mockSeparator = vi.fn();

interface MockLogger {
  print: Mock;
  println: Mock;
  skipLine: Mock;
  clear: Mock;
  title: Mock;
  success: Mock;
  error: Mock;
  warn: Mock;
  info: Mock;
  separator: Mock;
}

// Setup vi.mock (this gets hoisted)
vi.mock('../../src/helpers/logger.js', () => ({
  Logger: {
    print: mockPrint,
    println: mockPrintln,
    skipLine: mockSkipLine,
    clear: mockClear,
    title: mockTitle,
    success: mockSuccess,
    error: mockError,
    warn: mockWarn,
    info: mockInfo,
    separator: mockSeparator,
  },
}));

// Export the mock object with references to the same functions
export const mock_Logger: MockLogger = {
  print: mockPrint,
  println: mockPrintln,
  skipLine: mockSkipLine,
  clear: mockClear,
  title: mockTitle,
  success: mockSuccess,
  error: mockError,
  warn: mockWarn,
  info: mockInfo,
  separator: mockSeparator,
};

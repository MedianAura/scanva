import type { IFs } from 'memfs';
import type * as fs from 'node:fs';
import { vi } from 'vitest';

// Create a type for our mocked fs with vi.fn() wrapped methods
type MockedFs = IFs & {
  existsSync: ReturnType<typeof vi.fn<typeof fs.existsSync>>;
  readFileSync: ReturnType<typeof vi.fn<typeof fs.readFileSync>>;
};

// Store the mock fs objects at module level
let mockFs: MockedFs;

// Mock the 'fs' module
vi.mock('node:fs', async () => {
  const memfs = await vi.importActual<typeof import('memfs')>('memfs');

  mockFs = {
    ...memfs.fs,
    existsSync: vi.fn(memfs.fs.existsSync),
    readFileSync: vi.fn(memfs.fs.readFileSync),
  } as MockedFs;

  return { default: mockFs, ...mockFs };
});

// Export getters with proper types
export const getMockedFs = (): MockedFs => mockFs;

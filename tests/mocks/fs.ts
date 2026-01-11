import { type Mock, vi } from 'vitest';

// Define mock functions first
const mockExistsSync = vi.fn();
const mockWriteFileSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockUnlinkSync = vi.fn();
const mockReadDirectorySync = vi.fn();
const mockReaddirSync = vi.fn();
const mockCreateReadStream = vi.fn();
const mockCreateWriteStream = vi.fn();

interface MockFs {
  existsSync: Mock;
  writeFileSync: Mock;
  readFileSync: Mock;
  unlinkSync: Mock;
  readDirSync: Mock;
  readdirSync: Mock;
  createReadStream: Mock;
  createWriteStream: Mock;
}

// Setup vi.mock (this gets hoisted)
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const mocked = {
    ...actual,
    existsSync: mockExistsSync,
    writeFileSync: mockWriteFileSync,
    readFileSync: mockReadFileSync,
    unlinkSync: mockUnlinkSync,
    readDirSync: mockReadDirectorySync,
    readdirSync: mockReaddirSync,
    createReadStream: mockCreateReadStream,
    createWriteStream: mockCreateWriteStream,
  };
  return {
    ...mocked,
    default: mocked,
  };
});

// Export the mock object with references to the same functions
export const mock_Fs: MockFs = {
  existsSync: mockExistsSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
  unlinkSync: mockUnlinkSync,
  readDirSync: mockReadDirectorySync,
  readdirSync: mockReaddirSync,
  createReadStream: mockCreateReadStream,
  createWriteStream: mockCreateWriteStream,
};

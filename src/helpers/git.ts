import { spawnSync } from 'node:child_process';
import path from 'node:path';

export function getGitRoot(): string {
  const command = 'git';
  const commandSwitch = ['rev-parse', '--show-toplevel'];
  const gitRootIO = spawnSync(command, commandSwitch);

  if (gitRootIO.stdout.toString()) {
    return gitRootIO.stdout.toString().trim();
  }

  throw new Error('Could not determine git root directory');
}

export function getFilesFromCommit(commitHash: string = 'HEAD'): string[] {
  const command = 'git';

  const commandSwitch = ['diff-tree', '--no-commit-id', '--name-only', '-r', commitHash];
  const filesIO = spawnSync(command, commandSwitch);

  if (filesIO.stdout.toString()) {
    const gitRoot = getGitRoot();
    return filesIO.stdout
      .toString()
      .split('\n')
      .filter((file) => file.trim() !== '')
      .map((file) => path.resolve(gitRoot, file.trim()));
  }

  return [];
}

export function getDiffContent(commitReference: string = 'HEAD'): string {
  const command = 'git';
  // Use diff-tree to get the changes in the specific commit
  // -p flag shows the patch (diff content)
  // --no-commit-id omits the commit hash from output
  const commandSwitch = ['diff-tree', '-p', '--no-commit-id', commitReference];
  const diffIO = spawnSync(command, commandSwitch);

  if (diffIO.error) {
    throw new Error('Failed to retrieve git diff: .git directory not found or git not available');
  }

  if (diffIO.status !== 0) {
    throw new Error(`Git command failed with status ${diffIO.status}`);
  }

  return diffIO.stdout.toString();
}

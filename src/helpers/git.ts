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

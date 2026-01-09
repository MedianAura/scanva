import { readPackageSync } from 'read-pkg';
import { program } from '@commander-js/extra-typings';
import { CommandRunner } from './controllers/CommandRunner.js';
import { handleError } from './helpers/handleError.js';
import { Logger } from './helpers/logger.js';

const packageJSON = readPackageSync();

program
  .name(packageJSON.name)
  .description(packageJSON.description ?? '')
  .version(packageJSON.version)
  .action(async () => {
    await new CommandRunner().run();
  });

export async function run(): Promise<void> {
  Logger.clear();

  try {
    program.parse();
  } catch (error: unknown) {
    handleError(error);
  }
}

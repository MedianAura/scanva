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
  .option('-c, --commit <hash>', 'Specify commit hash to analyze', 'HEAD')
  .action(async ({ commit }) => {
    await new CommandRunner().run(commit);
  });

export async function run(): Promise<number> {
  Logger.clear();
  Logger.title('Scanva - Validation Tools');

  try {
    await program.parseAsync();
  } catch (error: unknown) {
    return handleError(error);
  }

  return 0;
}

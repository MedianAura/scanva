import { readPackageSync } from 'read-pkg';
import { program } from '@commander-js/extra-typings';
import { CommandRunner } from './controllers/command-runner.js';
import { handleError } from './helpers/handle-error.js';
import { Logger } from './helpers/logger.js';

const packageJSON = readPackageSync();

program
  .name(packageJSON.name)
  .description(packageJSON.description ?? '')
  .version(packageJSON.version)
  .argument('<job>', 'Job to run')
  .argument('[answer]', 'Provided answer files for the prompts')
  .action(async (job, answer) => {
    try {
      await new CommandRunner().run(job, answer);
    } catch (error: unknown) {
      handleError(error);
    }
  });

export async function run(): Promise<void> {
  Logger.clear();

  try {
    program.parse();
  } catch (error: unknown) {
    handleError(error);
  }
}

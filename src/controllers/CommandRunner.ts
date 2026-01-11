import { cosmiconfig, type CosmiconfigResult } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { getFilesFromCommit } from '../helpers/git.js';
import { Logger } from '../helpers/logger.js';
import { ConfigurationNotFoundError } from '../models/Errors.js';
import { Reporter } from '../services/Reporter.js';
import { RuleProcessor } from '../services/RuleProcessor.js';
import { type ScanvaConfig, ScanvaConfigSchema } from '../validators/ConfigSchemas.js';

export class CommandRunner {
  public async run(commitHash: string): Promise<void> {
    const result = await this.getConfig();

    if (!result) {
      throw new ConfigurationNotFoundError('Configuration file not found');
    }

    const config = await this.parseConfig(result.config);
    const files = getFilesFromCommit(commitHash);

    const reporter = new Reporter();
    const ruleProcessor = new RuleProcessor(reporter);
    await ruleProcessor.processRules(config, files);

    // Output all collected violations
    reporter.report();

    Logger.success('Job executed successfully');
  }

  private async parseConfig(config: unknown): Promise<ScanvaConfig> {
    const configData = typeof config === 'function' ? config() : (config as ScanvaConfig);
    return ScanvaConfigSchema.parse(configData);
  }

  private async getConfig(): Promise<CosmiconfigResult> {
    return cosmiconfig('scanva', {
      loaders: {
        '.ts': TypeScriptLoader(),
        '.cts': TypeScriptLoader(),
        '.mts': TypeScriptLoader(),
      },
      searchPlaces: [`scanva.config.js`, `scanva.config.ts`, `scanva.config.mjs`, `scanva.config.cjs`, `scanva.config.mts`, `scanva.config.cts`],
    }).search(process.cwd());
  }
}

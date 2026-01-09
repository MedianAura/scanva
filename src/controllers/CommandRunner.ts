import { cosmiconfig, type CosmiconfigResult } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { Logger } from '../helpers/logger.js';
import { ConfigurationNotFoundError } from '../models/Errors.js';
import { type ScanvaConfig } from '../models/ScanvaConfig.js';
import { ScanvaConfigSchema } from '../validators/ConfigSchemas.js';

export class CommandRunner {
  public async run(): Promise<void> {
    const result = await this.getConfig();

    if (result === null) {
      throw new ConfigurationNotFoundError('Configuration file not found');
    }

    const config = await this.parseConfig(result.config);
    console.log(config);

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

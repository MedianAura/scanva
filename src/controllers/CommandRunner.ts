import { cosmiconfig, type CosmiconfigResult } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { getFilesFromCommit } from '../helpers/git.js';
import { Logger } from '../helpers/logger.js';
import { ConfigurationNotFoundError } from '../models/Errors.js';
import { Reporter } from '../services/Reporter.js';
import { RuleProcessor, type RuleResult } from '../services/RuleProcessor.js';
import { type ScanvaConfig, ScanvaConfigSchema } from '../validators/ConfigSchemas.js';

export class CommandRunner {
  public async run(commitHash: string): Promise<void> {
    const result = await this.getConfig();

    if (result === null) {
      throw new ConfigurationNotFoundError('Configuration file not found');
    }

    const config = await this.parseConfig(result.config);
    const files = getFilesFromCommit(commitHash);

    const reporter = new Reporter();
    const ruleProcessor = new RuleProcessor(reporter);
    const ruleResults = await ruleProcessor.processRules(config, files);

    // Output flagged files summary
    this.outputFlaggedFilesSummary(ruleResults);

    Logger.success('Job executed successfully');
  }

  private outputFlaggedFilesSummary(ruleResults: RuleResult[]): void {
    // Collect all flagged files from all rules
    const allFlaggedFiles: Array<{ file: string; ruleName: string; errorLevel: string; pattern: string }> = [];

    for (const result of ruleResults) {
      for (const flaggedFile of result.flaggedFiles) {
        let patternString = flaggedFile.rule.pattern;
        if (flaggedFile.rule.find instanceof RegExp) {
          patternString = flaggedFile.rule.find.source;
        } else if (Array.isArray(flaggedFile.rule.find)) {
          patternString = flaggedFile.rule.find.join(', ');
        } else if (flaggedFile.rule.find) {
          patternString = flaggedFile.rule.find;
        }

        allFlaggedFiles.push({
          file: flaggedFile.file,
          ruleName: flaggedFile.rule.pattern,
          errorLevel: flaggedFile.errorLevel,
          pattern: patternString,
        });
      }
    }

    if (allFlaggedFiles.length === 0) {
      Logger.info('No flagged files found');
      return;
    }

    // Count by error level
    const byLevel: Record<string, number> = {};
    for (const item of allFlaggedFiles) {
      const level = item.errorLevel;
      if (!byLevel[level]) {
        byLevel[level] = 0;
      }
      byLevel[level]!++;
    }

    // Output summary
    Logger.skipLine();
    Logger.println('📋 Flagged Files Summary:');
    for (const [level, count] of Object.entries(byLevel)) {
      Logger.info(`${count} file(s) with error level: ${level}`);
    }
    Logger.skipLine();

    // Sort by error level (error > warn > info) then by filename
    const levelOrder = { error: 0, warn: 1, info: 2 };
    allFlaggedFiles.sort((a, b) => {
      const levelDiff = (levelOrder[a.errorLevel as keyof typeof levelOrder] ?? 999) - (levelOrder[b.errorLevel as keyof typeof levelOrder] ?? 999);
      if (levelDiff !== 0) return levelDiff;
      return a.file.localeCompare(b.file);
    });

    // Output detailed list
    Logger.println('📝 Flagged Files:');
    for (const item of allFlaggedFiles) {
      Logger.print(`  • ${item.file} [${item.errorLevel}] - Rule: ${item.ruleName}, Pattern: ${item.pattern}`);
    }
    Logger.skipLine();
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

import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/index.{js,ts}', 'src/entry.{js,ts}'],
  project: ['src/**/*.{js,ts}'],
  ignore: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.{js,ts,mjs,cjs,mts,cts}'],
  ignoreDependencies: ['eslint-formatter-pretty', 'ts-node'],
};

export default config;

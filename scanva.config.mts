import { defineConfig, Level } from './dist/index.js';

export default defineConfig({
  rules: [
    {
      files: '**/*.ts',
      pattern: 'import',
      level: Level.Error,
    },
    {
      files: '**/*.ts',
      pattern: 'await',
      level: Level.Warning,
    },
  ],
});

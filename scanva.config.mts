import { defineConfig, Level } from './dist/index.js';

export default defineConfig({
  rules: [
    {
      files: '**/*.ts',
      pattern: 'SomethingInFiles',
      level: Level.Warning,
    },
  ],
});

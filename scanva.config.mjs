import { defineConfig, Level } from './src';

export default defineConfig({
  rules: [
    {
      files: 'src/**/models/*.ts',
      pattern: 'SomethingInFiles',
      level: Level.Warning,
    },
    {
      find: /SomeRegEx/g,
      pattern: 'SomethingInFiles',
      level: Level.Error,
    },
    {
      find: ['bob', 'cool'],
      pattern: 'SomethingInFiles',
      level: Level.Warning,
    },
    {
      find: 'bob',
      pattern: 'SomethingInFiles',
      level: Level.Error,
    },
  ],
});

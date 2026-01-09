# Automaton

**Automaton** is a powerful Node.js CLI tool that enables developers to create automated job workflows using TypeScript configuration files. Define complex sequences of actions, interact with users through prompts, and automate your development workflow with type safety.

[![Version](https://img.shields.io/npm/v/@medianaura/automaton.svg)](https://npmjs.org/package/@medianaura/automaton)
[![Downloads/week](https://img.shields.io/npm/dw/@medianaura/automaton.svg)](https://npmjs.org/package/@medianaura/automaton)

- [Installation](#installation)
- [How it Works](#how-it-works)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Commands](#commands)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Installation

Install Automaton globally or locally in your project using your preferred package manager:

### npm

```bash
# Global installation
npm install -g @medianaura/automaton

# Local installation
npm install --save-dev @medianaura/automaton
```

### pnpm

```bash
# Global installation
pnpm install -g @medianaura/automaton

# Local installation
pnpm install --save-dev @medianaura/automaton
```

### yarn

```bash
# Global installation
yarn global add @medianaura/automaton

# Local installation
yarn add --dev @medianaura/automaton
```

**Requirements:**

- Node.js >= 22.0.0

## How it Works

Automaton operates on three core concepts:

1. **Jobs**: Collections of actions with unique IDs and descriptive names
2. **Actions**: Individual steps that can be shell commands (`cmd`) or custom JavaScript functions (`run`)
3. **Prompts**: Interactive questions that collect user input before job execution

When you run a job, Automaton:

1. Loads your configuration file
2. Executes all prompts to collect user input
3. Runs actions sequentially, substituting variables from user answers
4. Provides real-time feedback during execution

## Quick Start

1. **Create a configuration file** at your project root:

```typescript
// automaton.config.mts
import { defineConfig, createPrompt } from '@medianaura/automaton';

// `createPrompt` is a helper for defining reusable prompts. The `enquirer` object provides access to the Enquirer.js API.
const namePrompt = createPrompt(async (enquirer) => {
  const result = await enquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'What is your name?',
  });
  return result;
});

export default () => {
  return defineConfig({
    jobs: [
      {
        id: 'hello',
        name: 'Say Hello',
        actions: [{ type: 'cmd', cmd: 'echo "Hello, %(name)s!"' }],
        prompts: [namePrompt],
      },
    ],
  });
};
```

2. **Run your job:**

```bash
automaton hello
```

3. **Answer the prompt** and watch Automaton execute your workflow!

## Configuration

### Basic Structure

Create an `automaton.config.mts` (or `.js`, `.ts`, `.mjs`, `.cjs`, `.cts`) file at your project root to define your jobs. This file is essential for Automaton to function.

```typescript
import { defineConfig } from '@medianaura/automaton';

export default () => {
  return defineConfig({
    jobs: [
      // Your jobs go here
    ],
  });
};
```

### Job Definition

Each job requires:

- `id`: Unique identifier for the job
- `name`: Human-readable description
- `actions`: Array of actions to execute
- `prompts` (optional): Array of prompt functions

```typescript
{
  id: 'deploy',
  name: 'Deploy to production',
  actions: [
    // Actions here
  ],
  prompts: [
    // Prompts here
  ]
}
```

### Actions

#### Command Actions (`cmd`)

Execute shell commands with variable substitution:

```typescript
{
  type: 'cmd',
  cmd: 'npm run build',
  when: (answers) => answers.build === true  // Optional condition
}
```

**Variable Substitution:**
Use `%(variable)s` syntax to substitute user answers:

```typescript
{
  type: 'cmd',
  cmd: 'git commit -m "%(commit_message)s"'
}
```

#### Function Actions (`run`)

Execute custom JavaScript functions:

```typescript
{
  type: 'run',
  run: async (answers) => {
    console.log('Processing answers:', answers);
    // Custom logic here
    if (!answers.confirm) {
      process.exit(1);
    }
  },
  when: (answers) => answers.process === true  // Optional condition
}
```

#### Conditional Actions with `when`

The `when` property allows you to conditionally execute actions based on user answers or other logic. This is useful for:

- **Skipping unnecessary steps** based on user choices
- **Creating branching workflows** that adapt to different scenarios
- **Validating prerequisites** before running critical actions
- **Implementing dry-run modes** that skip destructive operations

**Examples:**

```typescript
// Skip git operations if repository is clean
{
  type: 'cmd',
  cmd: 'git add . && git commit -m "chore: release"',
  when: async (answers) => {
    // Note: `execa` must be installed as a dependency in your project for `execaCommand` to work.
    const { stdout } = await execaCommand('git status --porcelain');
    return stdout.trim().length > 0; // Only if there are changes
  }
}

// Only run database migrations in production
{
  type: 'cmd',
  cmd: 'npm run migrate:prod',
  when: (answers) => answers.environment === 'production'
}

// Skip git operations if repository is clean
{
  type: 'cmd',
  cmd: 'git add . && git commit -m "chore: release"',
  when: async (answers) => {
    const { stdout } = await execaCommand('git status --porcelain');
    return stdout.trim().length > 0; // Only if there are changes
  }
}

// Dry-run mode that skips destructive operations
{
  type: 'cmd',
  cmd: 'rm -rf dist/',
  when: (answers) => !answers.dryRun
}
```

The `when` function receives the same `answers` object as the action and should return `true` to execute the action or `false` to skip it. This makes your workflows more flexible and intelligent.

### Prompts

Create interactive prompts using the Enquirer API. The `createPrompt` function provides a convenient wrapper for creating prompt functions, standardizing prompt creation and providing a consistent API for future extensibility. The `enquirer` object passed to the `createPrompt` callback provides access to the full Enquirer.js API.

```typescript
import { createPrompt } from '@medianaura/automaton';

const myPrompt = createPrompt(async (enquirer) => {
  const result = await enquirer.prompt({
    type: 'select',
    name: 'environment',
    message: 'Choose deployment environment:',
    choices: ['development', 'staging', 'production']
  });
  return result;
});

const myUsernamePrompt = createPrompt(async (enquirer) => {
  const result = await enquirer.prompt({
    type: 'input',
    name: 'username',
    message: 'Enter your username:',
  });
  return result;
});

// Use in job
{
  id: 'deploy',
  name: 'Deploy application',
  actions: [
    { type: 'cmd', cmd: 'npm run deploy:%(environment)s' }
  ],
  prompts: [myPrompt, myUsernamePrompt]
}
```

#### Version Tools

Automaton includes built-in version management with `getVersionPrompt`, which prompts the user to select a new version (e.g., patch, minor, major) and provides the chosen version as `answers.version`.

```typescript
import { getVersionPrompt } from '@medianaura/automaton';

export default () => {
  return defineConfig({
    jobs: [
      {
        id: 'release',
        name: 'Create new release',
        actions: [
          {
            type: 'run',
            run: (answers) => {
              if (!answers.confirm) {
                console.log('Release cancelled.');
                process.exit(0); // Exit gracefully if not confirmed
              }
            },
          },
          { type: 'cmd', cmd: 'npm version %(version)s' },
          { type: 'cmd', cmd: 'git push --tags' },
        ],
        prompts: [getVersionPrompt],
      },
    ],
  });
};
```

## Commands

### Basic Usage

```bash
automaton <job> [answer-files]
```

- `<job>`: The ID of the job to run
- `[answer-files]`: Optional JSON files containing pre-defined answers

### Examples

```bash
# Run a job interactively
automaton deploy

# Run with pre-defined answers
automaton deploy answers.json

# Run the version job
automaton version
```

### Answer Files

Create JSON files to provide answers without prompts:

```json
// answers.json
{
  "environment": "production",
  "confirm": true,
  "version": "1.2.3"
}
```

```bash
automaton deploy answers.json
```

## Examples

### Example 1: Build and Deploy

```typescript
// automaton.config.mts
import { defineConfig, createPrompt } from '@medianaura/automaton';

const deployPrompt = createPrompt(async (enquirer) => {
  const env = await enquirer.prompt({
    type: 'select',
    name: 'environment',
    message: 'Select environment:',
    choices: ['staging', 'production'],
  });

  const confirm = await enquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: `Deploy to ${env.environment}?`,
    initial: false,
  });

  return { ...env, ...confirm };
});

export default () => {
  return defineConfig({
    jobs: [
      {
        id: 'deploy',
        name: 'Build and Deploy',
        actions: [
          { type: 'cmd', cmd: 'npm run test' },
          { type: 'cmd', cmd: 'npm run build' },
          {
            type: 'run',
            run: (answers) => {
              if (!answers.confirm) {
                console.log('Deployment cancelled');
                process.exit(0);
              }
            },
          },
          { type: 'cmd', cmd: 'npm run deploy:%(environment)s' },
        ],
        prompts: [deployPrompt],
      },
    ],
  });
};
```

### Example 2: Release Workflow

```typescript
// automaton.config.mts
import { defineConfig, getVersionPrompt, createPrompt } from '@medianaura/automaton';

const releaseNotesPrompt = createPrompt(async (enquirer) => {
  const result = await enquirer.prompt({
    type: 'input',
    name: 'notes',
    message: 'Enter release notes:',
    validate: (value) => value.length > 0 || 'Release notes are required',
  });
  return result;
});

export default () => {
  return defineConfig({
    jobs: [
      {
        id: 'release',
        name: 'Create new release',
        actions: [
          {
            type: 'run',
            run: (answers) => {
              if (!answers.confirm) {
                process.exit(4);
              }
            },
          },
          { type: 'cmd', cmd: 'npm run test' },
          { type: 'cmd', cmd: 'npm run build' },
          { type: 'cmd', cmd: 'npm version --force --no-git-tag-version %(version)s' }, // --force to bypass git checks, --no-git-tag-version to prevent npm from creating a git tag
          {
            type: 'cmd',
            cmd: 'git add . && git commit -m "chore: release v%(version)s\n\n%(notes)s"',
          },
          { type: 'cmd', cmd: 'git tag -a v%(version)s -m "Release v%(version)s"' },
          { type: 'cmd', cmd: 'git push && git push --tags' },
          { type: 'cmd', cmd: 'npm publish' },
        ],
        prompts: [getVersionPrompt, releaseNotesPrompt],
      },
    ],
  });
};
```

### Example 3: Database Migration

```typescript
// automaton.config.mts
import { defineConfig, createPrompt } from '@medianaura/automaton';

const migrationPrompt = createPrompt(async (enquirer) => {
  const name = await enquirer.prompt({
    type: 'input',
    name: 'migration_name',
    message: 'Migration name:',
    validate: (value) => value.length > 0 || 'Migration name is required',
  });

  const direction = await enquirer.prompt({
    type: 'select',
    name: 'direction',
    message: 'Migration direction:',
    choices: ['up', 'down'],
  });

  return { ...name, ...direction };
});

export default () => {
  return defineConfig({
    jobs: [
      {
        id: 'migrate',
        name: 'Run database migration',
        actions: [
          {
            type: 'cmd',
            cmd: 'npm run migration:create %(migration_name)s',
            when: (answers) => answers.direction === 'up',
          },
          { type: 'cmd', cmd: 'npm run migration:%(direction)s' },
          {
            type: 'run',
            run: (answers) => {
              console.log(`Migration ${answers.direction} completed successfully`);
            },
          },
        ],
        prompts: [migrationPrompt],
      },
    ],
  });
};
```

## Troubleshooting

### Common Issues

#### Configuration Not Found

**Error:** `Configuration file not found`

**Solution:** Ensure you have an `automaton.config.js`, `automaton.config.ts`, `automaton.config.mjs`, `automaton.config.cjs`, `automaton.config.mts`, or `automaton.config.cts` file at your project root.

#### TypeScript Compilation Errors

**Error:** TypeScript compilation fails

**Solution:**

- Check your TypeScript syntax
- Ensure all imports are correct
- Verify your `tsconfig.json` configuration

#### Command Not Found

**Error:** `automaton: command not found`

**Solution:**

- If installed locally, use `npx automaton` or add to your package.json scripts
- If installed globally, ensure npm global bin directory is in your PATH

#### Permission Denied

**Error:** Permission errors when running commands

**Solution:**

- **For global installations:** If you installed Automaton globally with `npm install -g`, you might need to run the installation command with `sudo` (e.g., `sudo npm install -g @medianaura/automaton`) on macOS/Linux, or ensure your user has appropriate permissions to write to the global npm directory.
- **For local scripts:** Ensure the script you are trying to run has execute permissions (e.g., `chmod +x your-script.sh`).
- **For file operations:** Check the permissions of the files or directories Automaton is trying to access or modify.

### Getting Help

If you encounter issues:

1. Check your configuration file syntax
2. Verify all required dependencies are installed
3. Ensure Node.js version >= 22.0.0
4. Run with debug mode for detailed logs

For more help, visit the [GitHub repository](https://github.com/MedianAura/automaton) or file an issue.

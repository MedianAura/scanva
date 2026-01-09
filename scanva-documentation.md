# Scanva - Git Change Validation Tool

## Overview

Scanva is a TypeScript CLI tool that scans git changes (staged files or specific commits) for files matching header comments or path patterns, then validates those files against specific patterns. It integrates seamlessly with git hooks like Husky and lint-staged.

### Core Problem Solved

Enforce code quality rules by:
1. **Header-based detection**: Files with special header comments (e.g., `@IsInSavedJson`)
2. **Path-based matching**: Files matching glob patterns (e.g., `/src/**/models/**/saved/*.ts`)
3. **Pattern validation**: Check if changed lines contain specific patterns (e.g., `@JsonProperty`)
4. **Error handling**: Exit with appropriate codes and detailed messages

## Example Use Case

```javascript
// File: src/models/UserSaved.ts
/**
 * @IsInSavedJson
 */
export class User {
  @JsonProperty  // This change should trigger validation
  name: string;
}
```

When this file is changed, scanva will:
1. Detect `@IsInSavedJson` header comment
2. Look for changes to lines containing `@JsonProperty`
3. Exit with error code 1 and report the violation

## Naming Decision

### Chosen Name: `scanva`
- **Repository**: `@medianaura/scanva`
- **CLI Command**: `scanva`
- **Rationale**: 
  - Minimalist approach (user preference)
  - Scanner + VA (validation)
  - CLI-friendly: `npx scanva`
  - Unique, memorable, tech-sounding

### Status: Likely Available ✅
Based on npm search research, no existing package named `scanva` with CLI functionality was found.

## Technology Stack

### Chosen: TypeScript (over Rust)

**Reasons:**
1. **Ecosystem Integration**: Works seamlessly with Husky, lint-staged, npm pipelines
2. **Development Speed**: Faster iteration, hot reloading, familiar debugging
3. **Git Operations**: I/O-bound tasks (git commands, file parsing) - no CPU bottleneck
4. **Package Distribution**: Simple npm publishing without native binary concerns
5. **Development Experience**: Lower learning curve, better tooling support

**Performance Note**: For this use case (scanning git changes, parsing comments), TypeScript performance is more than adequate. Bottlenecks will be git operations and file I/O, not code execution.

## Core Architecture

### Project Structure
```
scanva/
├── src/
│   ├── cli.ts              # Commander.js CLI interface
│   ├── git.ts              # Git operations (diff, staged files)
│   ├── parser.ts           # Header comment parsing
│   ├── validator.ts        # Pattern matching & validation logic
│   ├── config.ts           # Configuration file handling
│   └── types.ts            # TypeScript definitions
├── bin/
│   └── scanva             # CLI executable
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### CLI Interface
```bash
scanva                    # Check staged files
scanva --commit abc123     # Check specific commit
scanva --config .scanva.json # Custom config
scanva --init             # Create sample config
scanva --help             # Show usage
```

## Configuration System

### Dual Configuration Approach

1. **Header-based Configuration**
```javascript
// File contains header comment
/**
 * @IsInSavedJson
 */
```

2. **Path-based Configuration**
```json
{
  "rules": {
    "/src/**/models/**/saved/*.ts": {
      "pattern": "@JsonProperty",
      "level": "error"
    }
  }
}
```

3. **Combined Configuration File** (`.scanva.json`)
```json
{
  "rules": {
    "@IsInSavedJson": {
      "pattern": "@JsonProperty",
      "level": "error"
    },
    "/src/**/*.ts": {
      "pattern": "console\\.log",
      "level": "warning"
    }
  }
}
```

## Core Features

### 1. Git Integration
- **Staged files**: `git diff --cached --name-only`
- **Specific commits**: `git diff <commit>^ <commit>`
- **Diff parsing**: Line-by-line change detection
- **File filtering**: Only check relevant file types

### 2. Header Comment Parsing
```javascript
// Supported formats
/**
 * @IsInSavedJson
 */

/*
 * @CustomRule
 */

// @SimpleRule
```

### 3. Path Pattern Matching
- Uses `minimatch` for glob patterns
- Supports both inclusion and exclusion patterns
- Respects `.gitignore` patterns by default

### 4. Pattern Validation
```javascript
// Pattern types supported
"string literal"        // Exact string match
/regex/              // Regular expression
"@JsonProperty"       // Annotation patterns
"console\\.(log|warn)" // Regex with escaping
```

### 5. Error Levels
- **Warning**: Report but don't fail (exit code 0)
- **Error**: Report and fail (exit code 1)

### 6. Integration Compatibility
- **Husky**: `"pre-commit": "npx scanva"`
- **lint-staged**: `"*.ts": "scanva"`
- **CI/CD**: Direct CLI usage in pipelines

## Implementation Plan

### Phase 1: Core Infrastructure
1. **Project Setup**
   - Initialize TypeScript project
   - Configure build pipeline
   - Set up CLI structure with Commander.js

2. **Git Operations Module** (`git.ts`)
   - Get staged files list
   - Get specific commit diff
   - Parse unified diff format
   - Extract changed lines per file

3. **Configuration Module** (`config.ts`)
   - Load `.scanva.json` configuration
   - Validate configuration schema
   - Merge with default options

### Phase 2: Parsing & Validation
4. **Header Parser** (`parser.ts`)
   - Extract header comments from files
   - Parse annotation tags
   - Support multiple comment styles

5. **Validator Engine** (`validator.ts`)
   - Apply rules to changed files
   - Pattern matching logic
   - Error collection and reporting

### Phase 3: CLI & Integration
6. **CLI Interface** (`cli.ts`)
   - Command-line argument parsing
   - Output formatting (table, JSON, plain text)
   - Exit code handling

7. **Integration Features**
   - Husky configuration examples
   - lint-staged integration
   - CI/CD pipeline examples

### Phase 4: Polish & Documentation
8. **Testing Suite**
   - Unit tests for all modules
   - Integration tests with real git repos
   - CLI testing

9. **Documentation**
   - Comprehensive README
   - API documentation
   - Configuration guide
   - Integration examples

## Configuration Examples

### Basic Setup
```json
// .scanva.json
{
  "rules": {
    "@IsInSavedJson": {
      "pattern": "@JsonProperty",
      "level": "error"
    }
  }
}
```

### Advanced Configuration
```json
{
  "rules": {
    "@IsInSavedJson": {
      "pattern": "@JsonProperty",
      "level": "error",
      "message": "Files with @IsInSavedJson cannot modify @JsonProperty annotations"
    },
    "/src/**/*.ts": {
      "pattern": "console\\.(log|warn|error)",
      "level": "warning"
    },
    "/**/*.test.ts": {
      "pattern": "it\\(",
      "level": "info"
    }
  },
  "ignore": [
    "node_modules/**",
    "dist/**",
    "*.min.js"
  ]
}
```

### Integration Examples

#### Husky Integration
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx scanva"
    }
  }
}
```

#### lint-staged Integration
```json
// package.json
{
  "lint-staged": {
    "*.ts": "scanva --config .scanva.json"
  }
}
```

#### GitHub Actions Integration
```yaml
# .github/workflows/validate.yml
name: Validate Changes
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npx scanva --commit ${{ github.sha }}
```

## Next Steps

1. **Verify npm availability** using `npm name scanva`
2. **Initialize repository** at `@medianaura/scanva`
3. **Set up development environment**
4. **Implement core functionality** following the phased approach
5. **Add comprehensive testing**
6. **Publish to npm** once stable

## Unique Value Proposition

Scanva fills a unique gap in the git hook ecosystem by providing:
- **Dual-mode validation** (headers + path patterns)
- **Change-aware checking** (only validates modified lines)
- **Flexible configuration** (rules can be defined multiple ways)
- **Git-native integration** (works with existing git workflows)
- **Developer-friendly** (clear error messages, easy setup)

Unlike existing tools that focus on linting or formatting, scanva specifically targets business logic validation based on code annotations and file organization patterns.

---

*This document captures the full planning conversation and technical decisions made during the design phase of the scanva project.*
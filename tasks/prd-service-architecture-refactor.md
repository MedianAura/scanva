# PRD: Service Architecture Refactor - Centralize Git Logic, Pattern Matching, and Reporting

## Introduction

Refactor the service layer to improve separation of concerns, testability, and maintainability. This involves:

1. **Centralizing Git operations** into a single helper (`src/helpers/git.ts`)
2. **Extracting reusable pattern matching** into a utility function
3. **Creating a Reporter Service** to handle all user-facing output and logging
4. **Setting up Vitest** for unit testing the refactored code
5. **Updating services to throw errors** instead of swallowing them, letting main.ts handle failures

The goal is cleaner services that do one thing (business logic), not logging or error swallowing, with comprehensive test coverage.

## Goals

- Consolidate all git command invocations into `src/helpers/git.ts`
- Extract pattern matching logic into a reusable utility function
- Create a Reporter Service to centralize all user-facing output
- Implement unit tests with Vitest for utilities and services
- Remove Logger calls from DiffProcessor and RuleProcessor (they throw/return data)
- Ensure main.ts catches all errors via handleError()

## User Stories

### US-001: Consolidate Git Operations into Helper

**Description:** As a developer, I need all git command invocations in one place so changes to git handling are centralized and consistent.

**Acceptance Criteria:**

- [ ] Add `getDiffContent(commitRef: string = 'HEAD'): string` to `src/helpers/git.ts`
- [ ] Throws error if git command fails or .git directory not found
- [ ] Returns stdout as string (not empty string on error)
- [ ] Update DiffProcessor to use `getDiffContent()` from git helper
- [ ] Remove spawnSync import from DiffProcessor
- [ ] npm run check passes
- [ ] Write unit tests for `getDiffContent()` using Vitest
- [ ] All existing tests still pass

### US-002: Extract Reusable Pattern Matching Utility

**Description:** As a developer, I need a single pattern matching function so DiffProcessor and RuleProcessor don't duplicate the same logic.

**Acceptance Criteria:**

- [ ] Create `src/helpers/patternMatcher.ts` with function `hasPatternMatch(pattern: string | RegExp | string[], content: string): boolean`
- [ ] Handles RegExp, string[], and string patterns identically to current implementations
- [ ] Update RuleProcessor.hasPatternMatch() to use utility
- [ ] Update DiffProcessor.hasPatternInDiff() to use utility
- [ ] Remove duplicate pattern matching code from both services
- [ ] npm run check passes
- [ ] Write comprehensive unit tests for `hasPatternMatch()` covering all pattern types
- [ ] All existing tests still pass

### US-003: Set Up Vitest Infrastructure

**Description:** As a developer, I need a testing framework configured so I can write unit tests for utilities and services.

**Acceptance Criteria:**

- [ ] Install Vitest as dev dependency
- [ ] Create `vitest.config.ts` at project root
- [ ] Add npm scripts: `npm run test:unit` (run vitest)
- [ ] Configure Vitest to use TypeScript
- [ ] Create `src/**/*.test.ts` test file structure
- [ ] Verify scripts are added to package.json and sorted
- [ ] npm run check passes
- [ ] `npm run test:unit` runs successfully with zero tests

### US-004: Create Reporter Service

**Description:** As a developer, I need a Reporter Service to handle all user-facing output so services stay silent and focused on business logic.

**Acceptance Criteria:**

- [ ] Create `src/services/Reporter.ts` with class Reporter
- [ ] Implement methods: `onRuleProcessed(rule: Rule): void`, `onFileMatched(file: string): void`, `onViolation(file: string, rule: Rule, level: string): void`
- [ ] Implement `report(): void` method that outputs all collected data to user
- [ ] Reporter collects events during processing, outputs batch at end
- [ ] Output shows: total violations, violations by error level, list of flagged files
- [ ] Update RuleProcessor to call reporter methods instead of Logger calls (but don't remove Logger yet)
- [ ] npm run check passes
- [ ] Write unit tests for Reporter (mock Logger, verify output format)
- [ ] All existing tests still pass

### US-005: Refactor DiffProcessor to Throw Errors

**Description:** As a developer, I need DiffProcessor to throw errors instead of returning empty strings so error handling is centralized at the entry point.

**Acceptance Criteria:**

- [ ] Remove try-catch from getDiffContent() - let errors propagate
- [ ] Remove Logger.warn() calls from DiffProcessor
- [ ] getDiffContent() throws descriptive Error if git fails
- [ ] hasPatternInDiff() throws error if pattern is invalid (precondition check)
- [ ] Update RuleProcessor to catch errors from DiffProcessor if needed
- [ ] npm run check passes
- [ ] Write unit tests: verify errors are thrown, not silently returned
- [ ] All existing tests still pass

### US-006: Refactor RuleProcessor Error Handling

**Description:** As a developer, I need RuleProcessor to throw errors instead of logging warnings so failures propagate to main.ts for centralized handling.

**Acceptance Criteria:**

- [ ] Remove try-catch in findFilesWithPattern() - let file read errors propagate
- [ ] Remove try-catch in processRule() - let pattern match errors propagate
- [ ] Remove Logger.warn() calls from error handlers (but keep Logger.info() for progress)
- [ ] Throw descriptive Error if file cannot be read
- [ ] Throw descriptive Error if pattern matching fails
- [ ] Update DiffProcessor error handling in RuleProcessor to throw
- [ ] npm run check passes
- [ ] Write unit tests: verify errors are thrown in expected scenarios
- [ ] All existing tests still pass

### US-007: Remove Logging from Utilities, Keep Only in Reporter

**Description:** As a developer, I need services to stay silent so all output goes through Reporter.

**Acceptance Criteria:**

- [ ] Remove all Logger.\* calls from DiffProcessor except constructor/setup logging
- [ ] Remove Logger.warn() from RuleProcessor error paths (keep Logger.info() for progress)
- [ ] Verify Reporter.onViolation() is called by RuleProcessor for each violation
- [ ] All user-facing messages now flow through Reporter
- [ ] Update CommandRunner to call reporter.report() at end of processing
- [ ] npm run check passes
- [ ] All existing tests still pass

### US-008: Update Main.ts to Use Centralized Error Handling

**Description:** As a developer, I need main.ts to catch all errors from services so failures are reported consistently.

**Acceptance Criteria:**

- [ ] Verify handleError() catches all errors from CommandRunner
- [ ] Test with simulated errors (missing .git, invalid pattern, file read failure)
- [ ] Exit code 1 on any error
- [ ] Error message is user-friendly (not stack trace)
- [ ] npm run check passes
- [ ] All existing tests still pass

## Functional Requirements

- FR-1: All git operations (rev-parse, diff-tree, diff) must go through `src/helpers/git.ts`
- FR-2: Pattern matching logic (string, RegExp, array) must be centralized in `src/helpers/patternMatcher.ts`
- FR-3: Services must not call Logger - all output via Reporter
- FR-4: Services must throw errors on failure, not catch and return empty values
- FR-5: Main.ts catches all errors via handleError() and exits with code 1
- FR-6: Reporter collects events during processing and outputs batch report at end
- FR-7: Unit tests cover all refactored utilities and services with Vitest

## Non-Goals

- Do not modify existing CLI interface or user-facing output format (yet)
- Do not refactor other services (CommandRunner, ConfigValidator, etc.) in this task
- Do not change git command flags or behavior
- Do not add new features - this is refactoring only

## Technical Considerations

- Vitest should use TypeScript with strict type-checking
- Reporter should be injectable into RuleProcessor for testability
- DiffProcessor will need to handle error propagation - may need try-catch at call site if diff is optional
- Services should not import Logger after refactor
- Pattern matcher must handle edge cases: null content, null pattern, empty strings

## Success Metrics

- All git operations consolidated (zero git calls outside `src/helpers/git.ts`)
- Pattern matching code DRY (one function used in both DiffProcessor and RuleProcessor)
- 80%+ code coverage on utilities (git helper, pattern matcher) with Vitest
- Services throw errors instead of swallowing them
- All tests pass with zero warnings
- Codebase compiles without errors

## Open Questions

- Should DiffProcessor's getDiffContent() be called only once in RuleProcessor, or can it be lazy-loaded per rule?
- Should Reporter be a singleton or instantiated per command run?
- Should we add a `--verbose` flag to enable detailed reporting?

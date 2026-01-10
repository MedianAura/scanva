# PRD: Git Diff Rule Validation

## Introduction

Add git diff analysis to Scanva so that rule violations are tracked specifically against changes in recent commits. When rules match files with modified content, validate that the matched patterns appear in the git diff (marked with `+++` or `---`). Violated rules are collected in a flagged file list with their associated error levels, enabling tracking of rule violations in recent commits.

## Goals

- Create a new DiffProcessor service to analyze git diffs
- Check matched files against git diff changes
- Collect rule violations with error levels in a flagged file list
- Integrate automatically into RuleProcessor workflow
- Enable tracking of rules violated in recent commits without additional configuration

## User Stories

### US-001: Create DiffProcessor service

**Description:** As a developer, I need a service to analyze git diffs and check for pattern matches so it can be integrated into the rule processing pipeline.

**Acceptance Criteria:**

- [ ] Create `src/services/DiffProcessor.ts` with class `DiffProcessor`
- [ ] Implement method `getDiffContent(): string` to retrieve git diff using `spawnSync` (consistent with git.ts pattern)
- [ ] Implement method `hasPatternInDiff(pattern: string | RegExp | string[], diffContent: string): boolean`
- [ ] Use `spawnSync` from `node:child_process` (already used in helpers/git.ts)
- [ ] Typecheck passes
- [ ] Handle missing .git directory gracefully (return empty string or warn)

### US-002: Extend RuleResult to include flagged files

**Description:** As a developer, I need to store which files violated rules and their error levels so violations can be tracked.

**Acceptance Criteria:**

- [ ] Add `FlaggedFile` interface with properties: `file: string`, `rule: Rule`, `errorLevel: string`
- [ ] Extend `RuleResult` interface to include `flaggedFiles: FlaggedFile[]`
- [ ] Update RuleResult initialization in RuleProcessor
- [ ] Typecheck passes

### US-003: Integrate DiffProcessor into RuleProcessor

**Description:** As a system, I need to check matched files against git diff changes so rule violations are detected automatically.

**Acceptance Criteria:**

- [ ] Instantiate DiffProcessor in RuleProcessor
- [ ] After finding files matching rule pattern, check if pattern exists in diff
- [ ] For files with matches in diff, add to `flaggedFiles` with rule and errorLevel
- [ ] Log flagged violations with file and error level
- [ ] Typecheck passes

### US-004: Handle edge cases in diff validation

**Description:** As a system, I need to handle various scenarios gracefully so processing doesn't fail unexpectedly.

**Acceptance Criteria:**

- [ ] If no .git directory exists, skip diff validation (log warning, continue normally)
- [ ] If diff retrieval fails, catch error and log warning (don't crash)
- [ ] If pattern is RegExp, test against diff lines
- [ ] If pattern is array, check if any pattern exists in diff
- [ ] If pattern is string, check if string exists in diff
- [ ] Typecheck passes

### US-005: Output flagged files list

**Description:** As a user, I want to see which files violated rules in the recent commit so I can understand what needs fixing.

**Acceptance Criteria:**

- [ ] Summary output shows total flagged files count per error level
- [ ] Each flagged file shows: filename, rule name, error level, matched pattern
- [ ] Sorted by error level (error > warn > info) then by filename
- [ ] Typecheck passes

## Functional Requirements

- FR-1: DiffProcessor retrieves git diff using simple-git library
- FR-2: DiffProcessor checks if rule pattern matches any line in diff (includes `+++` or `---` indicators)
- FR-3: RuleProcessor calls DiffProcessor for each rule after matching files
- FR-4: For each file with pattern match in diff, create FlaggedFile entry with rule and errorLevel
- FR-5: RuleResult aggregates all flagged files per rule
- FR-6: Output handler displays flagged files grouped by error level
- FR-7: Graceful degradation if .git directory missing or diff fails

## Non-Goals

- No modification of git history
- No commit creation or amending
- No filtering of which commits to analyze (always use latest diff)
- No performance optimization for very large diffs (assume reasonable size)
- No custom diff format support (only git diff format)

## Technical Considerations

- Use `spawnSync` from `node:child_process` consistent with existing git.ts helper pattern
- DiffProcessor pattern matching reuses same logic as RuleProcessor (RegExp, array, string)
- Git diff output parsed line-by-line for pattern matching
- Error level comes from Rule object (rule.errorLevel or default to 'info')
- Cache diff content once retrieved and reuse across all rule checks in processRules()

## Success Metrics

- All rules automatically check diffs without config changes
- Flagged violations clearly indicate which rules were broken in commit
- No additional setup required beyond existing rule definitions
- Graceful handling of edge cases (no .git, diff failures)

## Open Questions

- Should diff content be cached across multiple rule checks? (Recommend yes for performance)
- Should we analyze only staged changes or all uncommitted changes? (Recommend uncommitted for maximum coverage)
- Should error level be customizable per rule or use global default? (Recommend per-rule via Rule.errorLevel)

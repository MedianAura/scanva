# PRD: Commit Range and Staged Mode Support

## Introduction

Enhance Scanva to support checking multiple commits in CI/CD pipelines and integrate with lint-staged for pre-commit workflows. Currently, Scanva only checks a single commit, which limits its usefulness in scenarios where multiple commits need to be validated (e.g., PR validation) or when checking only staged files before commit.

This feature adds:

- Commit range support (e.g., `main..HEAD` or `--from main --to HEAD`)
- Staged file detection for lint-staged integration
- Smart defaults for base branch comparison
- Auto-detection of staged context

## Goals

- Support Git range syntax (COMMIT..HEAD, COMMIT...HEAD) for checking multiple commits
- Support explicit flags (--from, --to) for commit range specification
- Auto-detect and check only staged files when appropriate¸
- Provide smart base branch detection with configuration override
- Change default behavior to check staged files when no arguments provided
- Maintain backward compatibility with explicit commit specification

## User Stories

### US-014: Add git staged files detection

**Description:** As a developer, I need Scanva to detect and analyze staged files so it can integrate with lint-staged and pre-commit workflows.

**Acceptance Criteria:**

- [ ] Implement function to get list of staged files using `git diff --cached --name-only`
- [ ] Filter staged files to only those matching configured patterns
- [ ] Handle case when no files are staged (exit gracefully with message)
- [ ] Add unit tests for staged file detection
- [ ] Typecheck passes
- [ ] Tests pass

### US-015: Implement commit range parsing (Git syntax)

**Description:** As a DevOps engineer, I want to specify a commit range using Git's native syntax so I can validate all commits in a PR or merge.

**Acceptance Criteria:**

- [ ] Parse `COMMIT..HEAD` syntax (two-dot range)
- [ ] Parse `COMMIT...HEAD` syntax (three-dot range, merge base)
- [ ] Parse `origin/main..HEAD` syntax (remote branch comparison)
- [ ] Extract all commits in the range
- [ ] Get aggregated diff for all commits in range
- [ ] Add unit tests for range parsing
- [ ] Typecheck passes
- [ ] Tests pass

### US-016: Add explicit --from/--to flags

**Description:** As a CI/CD pipeline developer, I want to use explicit flags for commit ranges so the command is more readable and explicit in pipeline configurations.

**Acceptance Criteria:**

- [ ] Add `--from <commit>` flag to specify range start
- [ ] Add `--to <commit>` flag to specify range end (defaults to HEAD)
- [ ] Support using `--from` alone (equivalent to `FROM..HEAD`)
- [ ] Validate that --from and positional range syntax are mutually exclusive
- [ ] Add CLI help text for new flags
- [ ] Add unit tests for flag parsing
- [ ] Typecheck passes
- [ ] Tests pass

### US-017: Add base branch detection and configuration

**Description:** As a developer, I want Scanva to automatically detect the appropriate base branch for comparison so I don't need to specify it manually in common scenarios.

**Acceptance Criteria:**

- [ ] Detect upstream tracking branch of current branch as default base
- [ ] Fall back to `origin/main` if no upstream set
- [ ] Fall back to `origin/master` if `origin/main` doesn't exist
- [ ] Add `--base-branch <branch>` flag to override auto-detection
- [ ] Add configuration option in scanva.config for default base branch
- [ ] Log which base branch is being used for transparency
- [ ] Add unit tests for base branch detection logic
- [ ] Typecheck passes
- [ ] Tests pass

### US-018: Update default behavior to check staged files

**Description:** As a developer using Scanva in pre-commit hooks, I want it to automatically check staged files when I run it without arguments so it works seamlessly with my workflow.

**Acceptance Criteria:**

- [ ] When no commit/range/flags specified, check staged files by default
- [ ] Show clear message indicating staged mode is active
- [ ] Exit with code 0 and helpful message if no files are staged
- [ ] Maintain backward compatibility: explicit commit arg still checks that commit
- [ ] Update CLI help text to reflect new default behavior
- [ ] Add integration tests for default behavior scenarios
- [ ] Typecheck passes
- [ ] Tests pass

### US-019: Add integration tests for range scenarios

**Description:** As a maintainer, I need comprehensive integration tests to ensure range and staged modes work correctly in real-world scenarios.

**Acceptance Criteria:**

- [ ] Test multi-commit range detection (create test repo with multiple commits)
- [ ] Test staged mode with various file types
- [ ] Test base branch detection in different repo states
- [ ] Test interaction between --from/--to and range syntax (should error)
- [ ] Test edge cases: empty ranges, invalid commits, detached HEAD
- [ ] All integration tests pass
- [ ] Typecheck passes
- [ ] Tests pass

### US-020: Update documentation and examples

**Description:** As a user, I need clear documentation on how to use commit ranges and staged mode so I can integrate Scanva into my pipelines and workflows.

**Acceptance Criteria:**

- [ ] Update README with commit range examples
- [ ] Add section on lint-staged integration
- [ ] Document base branch detection behavior
- [ ] Add CI/CD pipeline examples (GitHub Actions, GitLab CI)
- [ ] Update CLI help text comprehensively
- [ ] Add troubleshooting section for common range issues
- [ ] Typecheck passes
- [ ] Tests pass

## Functional Requirements

**Commit Range Support:**

- FR-1: The system must accept Git two-dot syntax (COMMIT..HEAD) to check all commits from COMMIT to HEAD
- FR-2: The system must accept Git three-dot syntax (COMMIT...HEAD) to check commits from merge base to HEAD
- FR-3: The system must accept explicit `--from` and `--to` flags as an alternative to range syntax
- FR-4: The system must accept remote branch references (e.g., origin/main..HEAD)
- FR-5: The system must aggregate all file changes across the commit range for pattern matching
- FR-6: The system must prevent mixing range syntax and --from/--to flags (mutually exclusive)

**Base Branch Detection:**

- FR-7: The system must detect the upstream tracking branch of the current branch as default base
- FR-8: The system must fall back to origin/main, then origin/master if no upstream is configured
- FR-9: The system must accept `--base-branch` flag to override auto-detection
- FR-10: The system must support configuring default base branch in scanva.config
- FR-11: The system must log which base branch is being used for transparency

**Staged Mode:**

- FR-12: When no arguments are provided, the system must check staged files by default
- FR-13: The system must use `git diff --cached` to detect staged files
- FR-14: The system must auto-detect staged context without requiring explicit flags
- FR-15: The system must show a clear message when running in staged mode
- FR-16: The system must exit gracefully with code 0 when no files are staged

**Backward Compatibility:**

- FR-17: The system must maintain support for single commit checking via positional argument
- FR-18: Explicit commit argument must override staged mode default

## Non-Goals

- No support for checking arbitrary file lists from arguments (rely on Git mechanisms)
- No support for comparing branches other than base..current (out of scope for MVP)
- No interactive mode for selecting commits from range
- No built-in retry logic for fetching remote branches
- No support for non-Git version control systems
- No automatic staging or unstaging of files

## Design Considerations

### CLI Interface

```bash
# New default behavior - staged files
scanva

# Explicit commit (backward compatible)
scanva abc123

# Range syntax
scanva main..HEAD
scanva origin/main...HEAD

# Explicit flags
scanva --from origin/main
scanva --from abc123 --to def456

# Override base branch detection
scanva --base-branch develop

# Show help
scanva --help
```

### Configuration

```typescript
// scanva.config.mts
export default {
  baseBranch: 'origin/develop', // Override default base branch
  // ... other config
};
```

### Output Messages

```
✓ Checking staged files (2 files)...
✓ Checking commits main..HEAD (5 commits, 8 files changed)...
✓ Using base branch: origin/main
ℹ No files staged, nothing to check
```

## Technical Considerations

- **Git command execution:** Use existing git helper functions, extend as needed
- **Commit range parsing:** Leverage `git rev-list` to enumerate commits in range
- **Diff aggregation:** Use `git diff COMMIT1..COMMIT2 --name-only` for efficiency
- **Error handling:** Validate commits exist before processing, provide helpful error messages
- **Performance:** For large ranges, diff aggregation is faster than per-commit processing
- **Cross-platform:** Ensure Git commands work on Windows, macOS, Linux
- **Testing:** Create test repositories with known commit histories for integration tests

## Success Metrics

- Users can validate entire PR diffs in CI/CD pipelines with one command
- Scanva integrates seamlessly with lint-staged without configuration
- Base branch detection works correctly in 95%+ of standard Git workflows
- No breaking changes to existing single-commit usage
- CLI help and documentation clearly explain all modes

## Open Questions

- Should we support excluding certain commits from a range (e.g., merge commits)?
- Should staged mode also check unstaged changes, or strictly cached only?
- Do we need a --no-staged flag to force checking HEAD when no args provided?
- Should we warn if checking a very large commit range (e.g., >100 commits)?

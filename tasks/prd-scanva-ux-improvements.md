# PRD: Scanva Output UX Improvements

## Introduction

Improve the user experience of Scanva's command-line output to make violations more actionable and visible. Current output is summary-focused and hides individual violations. New output should display violations at the file level with visual indicators, proper exit codes, and IDE-compatible formatting.

## Goals

- Fix exit code to be non-zero when errors exist (for CI/CD integration)
- Replace generic summary with detailed file-by-file violation list
- Add ASCII art visual indicators (● for error, ▲ for warning)
- Make output readable across all terminals and IDEs (PhpStorm, VS Code, etc.)
- Maintain full context about violations (rule pattern, location)

## User Stories

### US-009: Fix exit code on validation errors

**Description:** As a CI/CD system, I need a non-zero exit code when violations exist so the build fails properly.

**Acceptance Criteria:**

- [ ] Exit code = 1 when any ERROR violations exist
- [ ] Exit code = 0 only when no violations found
- [ ] WARNING-only runs still exit with 0
- [ ] Verify with: `node ./bin/run.js --commit <hash> && echo "Pass" || echo "Fail"`

### US-010: Display violations per file with indicators

**Description:** As a developer, I want to see each violation mapped to its file so I know exactly what to fix.

**Acceptance Criteria:**

- [ ] Output shows each flagged file as a section header
- [ ] Each violation listed under its file with visual indicator (● for error, ▲ for warning)
- [ ] Violation line shows: indicator, rule pattern/description, context
- [ ] File sections grouped by file path
- [ ] Typecheck passes

### US-011: Add ASCII art visual indicators

**Description:** As a user, I want instant visual distinction between errors and warnings without reading text.

**Acceptance Criteria:**

- [ ] ● (bullet/circle) prefix for ERROR violations
- [ ] ▲ (triangle) prefix for WARNING violations
- [ ] Indicators render correctly in VS Code, PhpStorm, and standard terminals
- [ ] ASCII symbols work when output piped to logs
- [ ] Verify visual rendering in 3 terminals/IDEs

### US-012: Format summary footer with counts

**Description:** As a developer, I want a quick count of total errors and warnings at the bottom.

**Acceptance Criteria:**

- [ ] Footer shows: "X Error(s), Y Warning(s)" on final line
- [ ] Shows only if violations exist
- [ ] Appears after all file sections
- [ ] Typecheck passes

### US-013: Refactor output from summary-first to details-first

**Description:** As a developer, I want violations shown first so I don't need to scroll past summaries.

**Acceptance Criteria:**

- [ ] Remove "Total violations" summary line
- [ ] Remove "ERROR: N" and "WARNING: N" summary sections
- [ ] Remove "Flagged files" list
- [ ] File-level details shown first (new US-010 format)
- [ ] Brief footer summary shown last (new US-012 format)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Exit process with code 1 if ERROR violations exist, 0 otherwise
- FR-2: For each flagged file, print header: `{file_path}`
- FR-3: For each violation, print: `{indicator} {violation_type} : {rule_pattern_or_description}`
  - indicator: ● for ERROR, ▲ for WARNING
  - violation_type: "Error" or "Warning"
  - rule_pattern_or_description: The violation message from the rule
- FR-4: Group violations by file
- FR-5: After all file sections, print footer: `{error_count} Error(s), {warning_count} Warning(s)`
- FR-6: Only show footer if violations > 0
- FR-7: Print success message "[SUCCESS] Job executed successfully" on successful run (no violations)

## Example Output Format

```
E:\workspaces\js\tools\scanva\src\controllers\CommandRunner.ts
● Error : Found a line changing {rulePattern}
▲ Warning : Found a line changing {anotherRulePattern}

E:\workspaces\js\tools\scanva\tests\unit\src\controllers\CommandRunner.spec.ts
● Error : Found a line changing {rulePattern}
▲ Warning : Found a line changing {anotherRulePattern}

2 Error(s), 2 Warning(s)
```

## Non-Goals

- Clickable file paths (nice-to-have, but not required for Phase 1)
- Colored terminal output (ASCII indicators sufficient)
- Sorting violations by severity or location
- Filtering violations by rule type

## Technical Considerations

- Modify the output formatter in the reporting module
- Use existing violation data structure (no schema changes)
- ASCII symbols (● U+25CF, ▲ U+25B2) work cross-platform
- Exit code set via `process.exit(code)` in main runner
- Ensure output works when piped to files or CI logs

## Success Metrics

- Exit code correctly indicates success/failure
- User sees violations first, summary last
- Output is scannable (visual indicators jump out)
- Works in VS Code, PhpStorm, and standard terminals

## Open Questions

- Should we add ANSI color codes (red/yellow) as optional flag?
- Should violations be sortable (by file, by severity)?
- Do we want rule descriptions or just rule patterns?

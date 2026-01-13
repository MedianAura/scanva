---
name: execute-ralph-task
description: Executes the next Ralph task from the project's PRD. Reads the current prd.json, finds the highest-priority incomplete task, implements it, and updates progress. Use when you want to autonomously complete one task in the refactoring roadmap.
---

# Execute Ralph Task

Execute the next incomplete task from the Ralph PRD and update progress.

## When to Use

- When asked to "execute the next task", "run ralph", or "complete a user story"
- To autonomously implement one task from the service architecture refactor
- To maintain continuity across Ralph iterations

## Instructions

1. **Read the Current PRD**:
   - Open `ralph/prd.json`
   - Find the user story with the highest priority where `passes: false`
   - Note the story ID, title, and acceptance criteria

2. **Read Progress Context**:
   - Open `ralph/progress.txt`
   - Review the "Codebase Patterns" section (top of file)
   - Review recent task implementations to understand patterns and learnings

3. **Checkout Branch**:
   - Read `branchName` from `prd.json`
   - Ensure you're on the correct branch: `git checkout <branchName>`
   - Create branch from main if it doesn't exist: `git checkout -b <branchName>`

4. **Implement the Task**:
   - Follow the acceptance criteria precisely
   - Match existing code patterns in the codebase
   - Write clean, focused code (avoid over-engineering)
   - Keep changes minimal and related

5. **Quality Checks**:
   - Run `npm run check` (formatting, linting, type-checking)
   - If fails, run `npm run fix` to auto-resolve issues
   - Run `npm run build` to verify all workspaces build
   - Run `npm run test` if tests exist for this area

6. **Update PRD**:

- Open `ralph/prd.json`
- Set `passes: true` for the completed story
- Save the file

7. **Document in Progress Log**:

- Append to `ralph/progress.txt` (never replace)
- Format:

8. **Commit Changes**:
   - Load the `commit-change` skill
   - Follow the commit message format from INSTRUCTIONS.md
   - Use message format: `feat: [Story Title]`

```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- Quality checks passed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Important Notes

- **One task per iteration**: Never implement multiple user stories at once
- **Check acceptance criteria**: Task is NOT done until ALL criteria pass
- **Frontend stories**: For UI changes, use dev-browser skill to verify in browser
- **Error handling**: Services should throw errors, not swallow them
- **No debugging output in code**: Remove console logs before committing
- **Follow existing patterns**: Match code style and architecture decisions

## Stop Condition

When the current task is complete:

Output: <promise>COMPLETE</promise>

NEVER DO MORE THAN ONE TASK AT A TIME

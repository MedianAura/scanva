---
name: prompt-engineering
description: Generates optimized prompts for AI professional developers through interactive clarification. Asks targeted questions to refine requirements, saves tokens, and ensures reliable outputs. Use when seeking the best prompt for a development task or when AI responses lack precision.
---

# Prompt Engineering for Developer Tasks

Generates high-quality, token-efficient prompts for AI software developers by asking clarifying questions before creating the final prompt.

## Core Workflow

1. **Listen**: Capture the user's initial need
2. **Clarify**: Ask targeted questions to remove ambiguity
3. **Structure**: Build a well-organized prompt using the 5-part framework
4. **Optimize**: Save tokens and improve reliability
5. **Deliver**: Present the final prompt and offer refinement

## Clarification Questions

Ask 3-5 of these, depending on the initial request:

### Context Questions

- **What's the broader context?** ("Building a feature", "Fixing a bug", "Refactoring code")
- **What codebase/framework are we working with?** (React, Node.js, TypeScript, etc.)
- **What's the audience for the output?** (Code review, team documentation, implementation)

### Specificity Questions

- **What's the exact problem you're trying to solve?** (Not "help me code" but "implement pagination in my React table")
- **Are there constraints or preferences?** (Performance requirements, tech stack, code style)
- **What should success look like?** (Working code, explanation, architecture diagram, etc.)

### Output Format Questions

- **What format do you want the response in?** (Code snippet, detailed explanation, step-by-step guide, architecture diagram)
- **How long should the response be?** (Quick 1-minute answer, thorough explanation, full implementation)
- **What level of detail do you need?** (High-level overview, implementation details, edge cases)

### Risk/Assumption Questions

- **Are there known gotchas or common mistakes?** (Edge cases, performance pitfalls, security concerns)
- **What should the AI explicitly avoid?** (Over-engineering, certain patterns, performance anti-patterns)
- **Do you need validation or testing included?** (Unit tests, integration tests, none)

## The 5-Part Prompt Framework

Structure optimized prompts with this pattern:

```
1. ROLE
   "Act as a [specific role] experienced in [domain]"

2. CONTEXT
   "We are [situation]. The goal is [objective]."

3. TASK
   "Create [specific deliverable]. It should [key requirements]."

4. CONSTRAINTS
   - Use [technology/language]
   - Avoid [anti-patterns]
   - Optimize for [priority: performance/readability/maintainability]

5. OUTPUT FORMAT
   "Format: [code/markdown/explanation]. Include [specific elements]."
```

## Token Optimization Tips

- **Be specific about deliverables**: "Generate a React hook" not "help with React"
- **Mention the tech stack early**: Saves AI from asking clarifications
- **State constraints upfront**: Avoids multiple iterations
- **Specify output format**: Prevents verbose unnecessary explanations
- **Use examples sparingly**: Only include if the AI might misunderstand

## Common Patterns

### Pattern: Code Implementation

```
Role: Expert [framework] developer
Context: We're building [feature] in [project type]
Task: Write a [component/function] that [specific behavior]
Constraints: Use TypeScript, optimize for performance, follow [patterns]
Output: Code with brief inline comments explaining key sections
```

### Pattern: Bug Investigation

```
Role: Senior debugger with [framework] expertise
Context: [Observed behavior]. Expected: [correct behavior]
Task: Identify the root cause and suggest fixes
Constraints: No breaking changes, maintain backward compatibility
Output: Explanation + code fix
```

### Pattern: Architecture Review

```
Role: Architect experienced in [domain]
Context: Current: [description]. Problem: [what's not working]
Task: Propose a better architecture that [desired outcomes]
Constraints: Works with [tech stack], team familiar with [level]
Output: Diagram (Mermaid) + explanation + migration path
```

### Pattern: Explanation/Learning

```
Role: Patient educator in [domain]
Context: User level: [beginner/intermediate/expert]
Task: Explain [concept] in the context of [specific problem]
Constraints: Use [analogies/examples], avoid [jargon/over-simplification]
Output: Step-by-step explanation with code examples
```

## When This Skill Helps Most

✅ **Use for:**

- First-time requests where requirements aren't crystal clear
- Complex features requiring multiple iterations
- When previous AI responses were too generic or missed the mark
- Teaching mode where you want specific explanation style
- Token-heavy projects where efficiency matters

❌ **Skip for:**

- Simple syntax questions ("How do I import X?")
- Quick code snippets you already know how to specify
- When you've already run through a successful prompt once

## Quick Checklist

Before delivering your final prompt, verify:

- [ ] Specific role/expertise identified
- [ ] Problem clearly stated (not vague)
- [ ] Success criteria defined
- [ ] Tech stack/constraints listed
- [ ] Output format explicit
- [ ] No ambiguous pronouns or undefined terms
- [ ] Token-efficient (no redundant explanations)

---
name: code-review
description: Thorough code review on specified files or current diff. Use when reviewing changes before commit or when asked to review code quality.
allowed-tools: Read, Grep, Glob, Bash
---

# /code-review

Perform a thorough code review on the specified files or diff.

## Instructions

Review the files I point you to, or the current git diff if I say "review my changes".

Run: `git diff` or `git diff main` to get the changeset if not explicitly provided.

Evaluate against the criteria in `review-rubric.md`.

## Output Format

Structure your review as:

**Summary** — one paragraph overall assessment

**Must Fix** — blocking issues (correctness, security, broken tests)

**Should Fix** — strong recommendations (FP violations, type issues, missing tests)

**Consider** — optional improvements worth discussing

**Looks Good** — what was done well (always include something genuine)

## Rules

- Be specific — reference line numbers or function names, not vague generalities
- Don't suggest rewrites for style preference alone — only flag things that matter
- If something is a personal preference vs. a real issue, label it as such
- Tone: direct and collegial, not pedantic

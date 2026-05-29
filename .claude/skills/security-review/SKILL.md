---
name: security-review
description: Security-focused review — input validation, secrets, injection, auth. Run before merging anything touching auth or external APIs.
allowed-tools: Read, Grep, Glob, Bash
---

# /security-review

Perform a security-focused review on the specified files or diff.

## Instructions

Review the files I point you to, or the current git diff if I say "review my changes".

Run: `git diff` or `git diff main` to get the changeset if not explicitly provided.

Focus exclusively on security concerns. Do not repeat feedback that belongs in `/code-review`.

Apply the checklist in `security-checklist.md`.

## Output Format

Structure your review as:

**Summary** — one paragraph overall security posture assessment

**Must Fix** — exploitable issues or high-confidence vulnerabilities (blocking)

**Should Fix** — likely risks worth addressing before shipping

**Consider** — lower-confidence concerns, defence-in-depth suggestions

**Looks Good** — security properties that are handled correctly (always include something genuine)

## Rules

- Be specific — reference exact lines, function names, or data flows
- Distinguish between theoretical risk and realistic exploitability
- If a finding only applies under certain deployment assumptions, state them
- Tone: direct, not alarmist

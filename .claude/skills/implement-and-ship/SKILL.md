---
name: implement-and-ship
description: Full flow from module scaffolding to committed PR — scaffold, review, fix, commit. Use when building and shipping a new module end-to-end.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /implement-and-ship

Orchestrate the full flow from module scaffolding to a committed, reviewed PR.

## Instructions

Run this when you are about to build a new module and want the full quality gate applied
before committing. Work through each phase in order. Do not skip phases.

---

## Phase 1 — Scaffold

Follow the `/new-module` workflow:

- Ask for module name, purpose, inputs/outputs, and dependencies
- Propose file structure and function signatures
- Wait for approval before writing any code
- Implement once approved

---

## Phase 2 — Review and fix

Run `/full-review` on the newly scaffolded module. It will handle the complete cycle:
code review → fix loop → adversarial review → fix loop, up to 2 passes each.

If `/full-review` exhausts its passes with issues remaining, stop here and surface the
outstanding findings to the user before proceeding.

---

## Phase 3 — Ship

1. Run `/pr-description` to generate the PR title and description
2. Run `/commit` to stage and commit with a conventional commit message

Report the commit hash and a one-line summary when done.

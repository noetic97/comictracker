---
name: bug-hunter
description: Systematic bug investigation — instrument first, fix with evidence. Use when debugging a problem that isn't immediately obvious.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /bug-hunter

Systematic bug investigation. Make the code observable first, then fix with evidence.

## Instructions

This command works in five phases: **Understand** → **Instrument** → **Hypothesize** → **Fix** → **Clean up**.
Do not attempt to fix anything until you have log evidence of what is actually happening.

Follow the phases defined in `debug-phases.md`.

---

## Rules

- Do not ask all clarifying questions — ask only the ones that would meaningfully change where you look
- Present instrumented code and ask the user to run it and share output. Do not proceed to fixing until log output is provided
- Confirm your hypothesis with the user before writing a fix
- Fix root causes, not symptoms

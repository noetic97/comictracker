---
name: new-module
description: Scaffold a new TypeScript module following project conventions. Use when creating a new module with types, logic, and tests.
allowed-tools: Read, Write, Edit, Bash
---

# /new-module

Scaffold a new TypeScript module following project conventions.

## Instructions

Ask me for the following if not already provided:
1. **Module name** — what is this module called? (e.g. `payment-processor`, `user-profile`)
2. **Purpose** — one sentence: what does this module do?
3. **Inputs/outputs** — what data goes in, what comes out?
4. **Dependencies** — does it need access to the DB, an external API, other modules?

Once you have this, produce a plan showing:
- The files you will create and their paths
- The exported functions and their type signatures
- Any types/interfaces that need to be defined

Wait for my approval before writing any code.

Use the structure defined in `module-structure.md`.

## Rules

- All functions must be pure unless the module is explicitly an infrastructure adapter
- Export only what consumers need — keep internals unexported
- Write tests alongside the implementation, not after
- No classes
- index.ts is a barrel file only — no logic lives there

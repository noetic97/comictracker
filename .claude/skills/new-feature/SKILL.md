---
name: new-feature
description: Spec-driven feature implementation. Discover → spec → implement. Use when starting a new feature from scratch.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /new-feature

Spec-driven feature implementation. Start from desired behavior, not code structure.

## Instructions

This command works in two phases: **Discover** then **Build**. Do not write any code until
the spec is approved.

---

## Phase 1 — Discovery

Ask me to describe the feature. Then ask clarifying questions to build a complete picture
before proposing anything. Good questions to ask (pick the relevant ones — do not ask all of them):

- Who uses this, and what are they trying to accomplish?
- What does success look like from the user's perspective?
- What are the edge cases or failure modes I should handle?
- Are there constraints I should know about (performance, auth, existing data shapes)?
- Does this touch existing functionality, or is it purely additive?
- What should explicitly _not_ be in scope for this feature?

Stop asking questions when you have enough to write a spec. Two or three focused questions
are better than an exhaustive list.

---

## Phase 2 — Spec

Write a feature spec using the structure in `spec-template.md`.

Present the spec and wait for approval. If I ask for changes, revise and re-present.

---

## Phase 3 — Implementation

Once the spec is approved:

1. If new modules are needed, follow the `/new-module` scaffolding pattern:
   - Propose file structure and function signatures first
   - Wait for approval before writing code
2. Implement against the acceptance criteria — each criterion should be satisfiable by a test
3. Write tests alongside implementation, not after
4. Stay within the agreed scope — surface anything that would require scope expansion

---

## Phase 4 — Verify

After implementation, confirm each acceptance criterion is met. For any criterion that
cannot be verified by a test, explain how to verify it manually.

Then run `/full-review` before considering the feature done. This runs the full quality gate — code review, fix loop, adversarial review, fix loop — and stops early if blockers are found at any stage.

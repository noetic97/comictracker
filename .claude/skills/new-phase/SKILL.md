---
name: new-phase
description: Scaffold a multi-session implementation phase with a tracking file. Use when a goal spans multiple sessions and needs step-level progress tracking.
allowed-tools: Read, Write, Edit, Bash
model: sonnet
---

# /new-phase

Scaffold a multi-session implementation phase. Creates a `.claude/IMPL-<slug>.md` tracking file
and updates `CONTEXT.md` to point at it. Use this when a goal spans more than one session and
needs step-level progress tracking across commits and PRs.

## When to use

| Situation                                      | Command          |
| ---------------------------------------------- | ---------------- |
| Investigating a technical question             | `/research`      |
| Shipping a single self-contained feature       | `/new-feature`   |
| **Multi-session work across several concerns** | **`/new-phase`** |

---

## Usage

```
/new-phase <slug> — <goal summary>
```

Example: `/new-phase hardening-docs — security fixes, documentation overhaul, and unit test coverage`

---

## Instructions

### Step 1 — Clarify scope

Ask the user:

- What is the overall goal of this phase? (one paragraph)
- What are the rough areas of work? (helps size the step list)
- Any hard constraints on ordering or parallelism?

If the goal is already clear from the invocation, skip straight to Step 2.

### Step 2 — Break into steps

Each step must:

- Fit in a single focused session
- Produce one logical commit (or a small PR for code changes)
- Have a clear "done" signal (tests pass, doc exists, review cycle complete)

Group steps by track if there are multiple independent workstreams.

### Step 3 — Write the IMPL file

Create `.claude/IMPL-<slug>.md`:

```markdown
# Implementation: <Phase Goal>

> **Workflow per step:** implement → update IMPL + BACKLOG → review cycle (if code) → commit → push PR → `/clear`
> Each step is one focused session. Start a new session per step.
> Reference: `.claude/CONTEXT.md` for current focus and last completed step.

---

## End-of-Session Ritual

At the end of every session:

1. Mark this step `complete` and record the PR number (or "no PR — docs/research only")
2. Update `CONTEXT.md`: set `Last Completed` and `Next Up` to the exact next step
3. If code changed: run review cycle → PR → `/clear`
4. If docs/research only: commit to short-lived branch → PR → `/clear`

---

## Steps

| Step | Track | Description | Status  | Branch | PR  |
| ---- | ----- | ----------- | ------- | ------ | --- |
| 1    | ...   | ...         | pending | —      | —   |
| ...  | ...   | ...         | pending | —      | —   |

---

### Step 1 — <Title>

**Track:** <track name>
**Branch:** `<branch-name>`
**Status:** `pending`

**What to do:**
<specific instructions for this session>

**Acceptance criteria:**

- [ ] ...
- [ ] ...
```

### Step 4 — Update CONTEXT.md

Add or update two sections:

**Current Focus** — replace whatever was there:

```
**Active:** <Phase goal> — see `.claude/IMPL-<slug>.md`. Start there at the beginning of each session.
```

**Last Completed / Next Up** — add above the existing Next Up section:

```
## Last Completed
(none yet — phase just started)

## Next Up
Step 1 — <description> — see IMPL-<slug>.md
```

### Step 5 — Report

Tell the user:

- Path to the new IMPL file
- How many steps were created and what the tracks are
- What Step 1 is and what the session will produce
- Reminder of the end-of-session ritual

---

## Closing a phase

When all steps are `complete`:

1. Delete the IMPL file: `git rm .claude/IMPL-<slug>.md`
2. Update `CONTEXT.md`: clear Current Focus, update Last Completed to "Phase complete — <slug>"
3. Move any deferred items to `BACKLOG.md`
4. Commit: `chore: close <slug> phase — all steps complete`

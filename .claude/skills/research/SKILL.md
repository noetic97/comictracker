---
name: research
description: Plan and document a technical research question into a structured RESEARCH file. Use when a decision needs investigation before implementation.
allowed-tools: Read, Write, Bash, Grep, Glob
model: sonnet
---

# /research

Plan and document a technical research question. Produces a structured `.claude/RESEARCH-<slug>.md`
that drives implementation decisions and backlog entries, then gets deleted once it has served its purpose.

## Usage

```
/research <question or topic>
```

Example: `/research should we switch from SQLite to Postgres for multi-user concurrency`

---

## Instructions

### Step 1 — Clarify scope

Restate the research question in one sentence. Identify:

- What decision or implementation will this unblock?
- What is out of scope?

If the question is too vague to answer usefully, ask one clarifying question before proceeding.

### Step 2 — Research

Do the work: read relevant source files, check dependency docs, search for known issues or
prior art. Be thorough on tradeoffs — the point of a research doc is to surface what isn't obvious.

### Step 3 — Write the doc

Create `.claude/RESEARCH-<slug>.md` where `<slug>` is a short kebab-case label for the topic.

Use this structure:

```markdown
# Research: <Topic>

> **Status:** Active | Complete
> **Question:** <one-sentence statement of what this doc answers>
> **Unblocks:** <what decision or task this enables>

---

## TL;DR

<2–4 bullet points: the answer and key recommendations, before all the detail>

---

## Findings

<The detailed research. Use sections as needed. Be specific — include code snippets,
benchmark numbers, version caveats, known issues.>

---

## Recommendations

For each recommendation, tag it:

- `[implement-now]` — should be done as a direct result of this research
- `[backlog]` — real improvement, but not urgent; add to BACKLOG.md
- `[decision-only]` — no code change needed; just record the decision

| Tag | Recommendation | Notes |
| --- | -------------- | ----- |
| ... | ...            | ...   |

---

## Lifecycle

This doc can be deleted when:

- [ ] All `[implement-now]` items are done (or explicitly deferred with a reason)
- [ ] All `[backlog]` items are added to `BACKLOG.md`
- [ ] Any `[decision-only]` items are noted in `CONTEXT.md` or an ADR if significant

**Do not delete this doc until the checklist above is complete.**
```

### Step 4 — Backlog pass

For every `[backlog]` item in the recommendations table, add it to `.claude/BACKLOG.md` now.
Do not leave this for later — the doc can only be deleted once it's done.

### Step 5 — Report

Tell the user:

- Where the doc was written
- What `[implement-now]` items exist and whether you're ready to start on them
- What was added to the backlog
- What the lifecycle checklist looks like

---

## Deleting a research doc

When the lifecycle checklist is complete, delete the file and commit it:

```bash
git rm .claude/RESEARCH-<slug>.md
```

Include `docs: delete RESEARCH-<slug>.md — all items implemented or backlogged` as the commit message.

---

## Rules

- Never pad findings — if the answer is simple, the doc should be short
- Do not write recommendations you won't stand behind — if something is genuinely uncertain, say so
- `[implement-now]` items should be actionable immediately, not "consider whether to..."
- The doc is a working artifact, not a permanent reference — bias toward deletion

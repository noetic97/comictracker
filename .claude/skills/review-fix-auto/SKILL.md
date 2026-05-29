---
name: review-fix-auto
description: Autonomously implement review findings and re-run the review, looping until clean. Use after code-review or adversarial-review for hands-off fix cycles.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /review-fix-auto

Autonomously implement findings from the most recent code or adversarial review, re-run the review, and loop until clean or 2 passes are exhausted.

> **Autonomous mode.** For manual step-by-step fixing with confirmations, use `/review-fix` instead.

## Instructions

This command picks up where `/code-review` or `/adversarial-review` left off. Do not use it without a review already present in the conversation.

---

## Step 1 — Read findings

Parse the most recent review output from the conversation. Note which review produced it (`/code-review` or `/adversarial-review`) — you will re-run that same review after fixing.

If the findings contain **more than 8 Must Fix / Critical items**, stop here and flag it:

> ⚠ This finding list is large enough that automated remediation is likely to be unreliable.
> Recommend addressing the top 3 manually, then re-running. Proceed only if the user confirms.

---

## Step 2 — Triage

Classify each finding:

**Implement now**

- Must Fix (from code-review) or Critical (from adversarial-review)
- Should Fix items that are self-contained: fix touches ≤ ~20 lines and requires no architectural change

**Add to `BACKLOG.md`, do not implement**

- Should Fix items that are architectural, cross-cutting, or involve more than ~20 lines
- Consider / informational findings

Never skip the backlog step. If there are deferred findings, they must be written to `BACKLOG.md` before proceeding to fixes.

---

## Step 3 — Implement

Work through the "implement now" items in severity order. For each:

1. State the problem and where it lives (file:line or function name)
2. Apply the fix
3. Confirm what changed and why it addresses the root cause

Do not refactor, rename, or touch anything not directly implicated by a finding. Stay within the blast radius of the issue. If a fix would require modifying a file outside the original diff scope, stop and ask before proceeding.

---

## Step 4 — Re-run review

Re-run the same review that produced the findings, scoped to only the files modified during Step 3. List which files are being re-reviewed — do not re-read the full original diff. Note this is **pass N** so the loop count is visible.

---

## Step 5 — Evaluate and loop

- **No Must Fix / Critical findings remaining** → done. Report: passes taken, issues fixed, items deferred to backlog.
- **Must Fix / Critical findings remain, pass < 2** → return to Step 3.
- **Must Fix / Critical findings remain, pass = 2** → stop (pass 2 has completed and issues remain). Present a summary of what remains, what was attempted, and why it wasn't resolved. Ask the user for guidance.

Only Must Fix / Critical items count toward the loop termination condition. Should Fix items sent to backlog do not stall the loop.

---

## Rules

- Deferred findings must be written to `BACKLOG.md` — this is required, not optional
- No confirmation prompts between fixes unless a fix requires expanding scope
- Fix root causes, not symptoms
- Keep changes minimum necessary — no opportunistic cleanup
- If an issue turns out to be invalid or already handled, say so explicitly rather than silently skipping it

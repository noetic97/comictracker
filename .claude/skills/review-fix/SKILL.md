---
name: review-fix
description: Work through review findings interactively, one fix at a time. Use after code-review or adversarial-review to implement findings manually.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /review-fix

Work through findings from a code or adversarial review interactively, one fix at a time.

> **Manual mode.** For autonomous fix-and-recheck looping, use `/review-fix-auto` instead.

## Instructions

This command picks up after `/code-review` or `/adversarial-review` has produced a list of findings.
Do not start fixing until the issue list is confirmed and ranked.

---

## Step 1 — Collect the issues

If I paste in a review output, parse it. Otherwise, ask me to paste the findings or point to
the session output. Accept any format: bullet list, numbered list, Must Fix / Should Fix sections.

Do not proceed until you have a complete list.

---

## Step 2 — Rank and confirm

Group the issues by severity:

**Blocking** — correctness bugs, security holes, broken behaviour. Must fix before merging.
**Non-blocking** — strong recommendations, type issues, test gaps. Worth fixing but won't hold the commit.
**Defer** — style preferences, future work, out of scope for this change.

Present the ranked list and ask which issues to address in this session. Wait for confirmation
before touching any files.

---

## Step 3 — Fix one at a time

Work through the confirmed issues in blocking-first order.

For each issue:

1. State what the problem is and where it lives (file:line or function name)
2. Describe the fix you are about to make
3. Apply the fix
4. Confirm what changed and why the fix addresses the root cause — not just the symptom

Do not batch fixes. One issue per round. Stop after each and wait for a go-ahead unless
the user says to run through all of them.

---

## Step 4 — Verify

After all fixes are applied:

- Re-read the original issue list and confirm each item is addressed or explicitly deferred
- If any fix introduced new concerns, flag them — do not silently expand scope to fix them
- Suggest running `/code-review` again if the fixes were substantial — scope it to only the files modified during this session, not the full original diff

---

## Rules

- Fix root causes, not symptoms
- If a fix requires a scope change the user did not approve, stop and ask
- Do not refactor surrounding code while fixing — stay within the blast radius of the issue
- If an issue turns out to be invalid or already handled, say so explicitly rather than silently skipping it

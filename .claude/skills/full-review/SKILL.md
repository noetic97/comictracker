---
name: full-review
description: Complete review cycle — code review then adversarial review with autonomous fix loops between each stage. Use before merging significant changes.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /full-review

Run a complete automated review-and-fix cycle: code review, then adversarial review, with autonomous fix loops between each stage.

## Instructions

Accept the same scope argument as `/code-review` (specific files, "my changes", a branch, etc.).
If no argument is given, default to the current git diff.

---

## Step 1 — Preflight check

Invoke the `diff-explorer` subagent to map the changeset. It will run `git diff` and produce:
- A plain-language changeset summary
- Files changed with one-line annotations
- Risk areas to focus on
- Dependencies touched
- Test coverage assessment

Use the `diff-explorer` output to inform scope for all subsequent steps. Pass it as context when invoking reviewers.

If the diff-explorer reports **more than 10 files** or **more than 400 lines** changed:

> ⚠ Large diff detected: [stat output]
>
> Review quality and automated fix reliability degrade significantly at this scale.
> Consider splitting this change into smaller logical batches before proceeding.
> Type **continue** to override and proceed anyway, or stop here to split the work.

Wait for confirmation before continuing. If the user overrides, note that findings may be incomplete and fixes less reliable.

---

## Step 2 — Code review

Run `/code-review` on the specified scope.

**If Must Fix or Should Fix findings are present:**

> Passing findings to `/review-fix-auto` — pass 1 of 2.

Invoke `/review-fix-auto`. It will implement fixes, re-run code review, and loop up to 2 passes.

- If it resolves all Must Fix / Should Fix items → proceed to Step 3.
- If it exhausts 2 passes with issues remaining → stop. Present the outstanding findings and ask the user how to proceed. Do not continue to adversarial review.

**If no Must Fix or Should Fix findings:** proceed directly to Step 3.

---

## Step 3 — Adversarial review

Invoke the `adversarial-reviewer` subagent directly on the same scope. Pass the diff-explorer map from Step 1 as context so it knows where to focus. The adversarial-reviewer runs read-only in an isolated context — it cannot apply fixes, only surface findings.

**If Critical or Should Fix findings are present:**

> Passing findings to `/review-fix-auto` — pass 1 of 2.

Invoke `/review-fix-auto`. Same loop rules as Step 2.

- If it resolves all Critical / Should Fix items → proceed to Step 4.
- If it exhausts 2 passes with issues remaining → stop and surface to user.

**If no Critical or Should Fix findings:** proceed to Step 4.

---

## Step 4 — Done

Report a summary:

> ✓ Full review complete.
> Code review: [N issues fixed, M deferred to backlog]
> Adversarial review: [N issues fixed, M deferred to backlog]
> Total passes: [N]

---

## Rules

- Pass the same scope argument through to all review and implementer invocations
- Do not proceed to adversarial review if code review has unresolved Must Fix items
- Consider findings from either review go to `BACKLOG.md`, not to `/review-fix-auto`
- This command is a sequencer — do not add review logic here; delegate to the review commands

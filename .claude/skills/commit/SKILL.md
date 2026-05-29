---
name: commit
description: Stage files and commit with a conventional commit message. Use when ready to commit current changes.
allowed-tools: Read, Bash
model: sonnet
---

# /commit

Stage changed files and commit with a descriptive conventional commit message.

## Instructions

Run the following to understand what has changed:

```bash
git branch --show-current
git status
git diff
git diff --staged
```

If the current branch is `main` or `master`, **do not commit directly**. Instead, create
an appropriately named branch from the staged changes and switch to it:

```bash
git checkout -b <type>/<short-description>
```

Derive the branch name from the changes: use the conventional commit type as the prefix
(`feat`, `fix`, `refactor`, `chore`, `docs`) and a short kebab-case description of the
work. Example: `chore/commands-tooling`, `feat/thumbnail-cache`, `fix/zip-cancel-race`.

Inform the user which branch was created before proceeding with the commit.

## Steps

1. **Identify what to stage** — list the files that belong to this logical change. If unrelated changes are present in the working tree, stage only the relevant files and note what was left out.

   When grouping is ambiguous (many untracked files across different concerns), print the full file list and ask which belong to this commit before staging anything. Do not guess.

2. **Draft the commit message** — follow the conventional commit format:

   ```
   <type>: <concise description>
   ```

   Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`

   The description should explain _what changed and why_, not just restate the filenames.
   Keep it under 72 characters.

   If the change warrants it, add a short body (one blank line after the subject) with additional context.

3. **Update CONTEXT.md if warranted** — review what this commit changes and ask: does it affect
   any section of `.claude/CONTEXT.md`? Specifically:
   - Did an active decision get made or superseded? → update **Active Decisions**
   - Did in-progress work complete or shift? → update **In Progress** or **Next Up**
   - Was a new gotcha or constraint discovered? → add to **Known Gotchas**
   - Did the current focus change? → update **Current Focus**

   If yes to any of the above, update `.claude/CONTEXT.md` now and stage it as part of this
   commit. Keep the update concise — bullet points, no prose. Do not clear **Session Notes**
   unless the user explicitly says to.

   If no section is affected, leave CONTEXT.md untouched.

4. **Stage and commit**:

   ```bash
   git add <specific files>
   git commit -m "<message>"
   ```

   Always add the co-author trailer:

   ```
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   ```

## Rules

- Never use `git add .` or `git add -A` — always add specific files
- Never use `--no-verify`
- If a pre-commit hook fails, fix the underlying issue — do not bypass it
- Do not commit `.env` files, credentials, debug logs, or commented-out code
- If the working tree contains changes that should be a separate commit, say so and stop

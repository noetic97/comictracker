---
name: pr-description
description: Generate PR title and description from the current changeset. Use when preparing a pull request.
allowed-tools: Read, Bash
model: sonnet
---

# /pr-description

Generate a pull request title and description from the current changeset.

## Instructions

Run the following to get the full picture before writing anything:

```bash
# Detect base branch, remote, and repo slug
git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's|origin/||'
git branch --show-current
git config branch.$(git branch --show-current).remote
git remote get-url $(git config branch.$(git branch --show-current).remote 2>/dev/null || echo origin)

git log $(git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo origin/main)...HEAD --oneline
git diff $(git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null || echo origin/main)...HEAD
```

From `git remote get-url`, extract the repo slug (`owner/repo`) by stripping the host prefix and `.git` suffix.
For SSH aliases like `gitea-noetic97:noetic97/ai-dev-kit.git`, the slug is everything after the first `:` minus `.git`.
For HTTPS URLs like `https://github.com/owner/repo.git`, take the last two path segments minus `.git`.

Use the detected base branch, remote, and repo slug throughout. Fall back to `main`, `origin`, and omitting `--repo` if detection fails.

Read **every changed file** in the diff — not just source code. Documentation, config,
templates, and command files all count. A missing entry in README.md or a new file not
reflected in a config is a gap that belongs in the PR description.

Use the output format defined in `pr-template.md`.

## Create the PR

**First: verify we are not on the default branch.**
If `git branch --show-current` matches the detected base branch (e.g. `main` or `master`),
stop immediately and tell the user:

> Cannot create a PR from the default branch. All commits need to be on a feature branch first.
> Create one now with: `git checkout -b <type>/<short-description>`

Do not push, do not generate a description. Wait for the user to switch branches.

After generating the description, detect whether a PR already exists for this branch,
then push and create/update the PR by running the commands directly — do not print
them as a code block for the user to run manually.

Check for an existing PR:

```bash
tea pr list --repo <owner/repo> --output json 2>/dev/null
```

Parse the JSON for an entry whose `head.ref` matches the current branch. If found, note the PR number.

Write the description body to a temp file to avoid shell escaping issues with markdown content, then run the push and create/update steps:

```bash
cat > /tmp/pr-body.md <<'PRBODY'
<generated body>
PRBODY

# Push (skips if branch already on remote)
git ls-remote --exit-code <remote> <current-branch> \
  && echo "branch already on remote" \
  || git push -u <remote> <current-branch>

# If PR exists — update via Gitea API:
tea api -X PATCH repos/<owner/repo>/pulls/<pr-number> \
  -f title="<generated title>" \
  -F body=@/tmp/pr-body.md

# If no PR exists — create it:
tea pr create \
  --repo <owner/repo> \
  --title "<generated title>" \
  --description "$(cat /tmp/pr-body.md)" \
  --base <detected-base-branch> \
  --head <current-branch>
```

Run only the relevant command (update OR create) — not both. Report the PR URL when done.

## Wrap up

After reporting the PR URL:

### 1. Prompt to start a new chat

Tell the user:

> PR is up. To avoid quadratic token costs from a long conversation, consider starting a fresh
> chat now with `/clear`.

## Rules

- Read the full diff before writing anything — do not summarise from filenames alone
- If any file in the diff is not reflected in the summary, flag it explicitly as potentially missing context
- The title must accurately describe the _dominant_ change, not just one part of it
- Do not pad the summary — if it was a small change, the description should be short
- Tone: direct, past tense ("add X", "fix Y", "remove Z")

---
name: changelog
description: Generate a CHANGELOG entry from recent git history. Use when preparing a release or summarizing recent work.
allowed-tools: Read, Bash
model: sonnet
---

# /changelog

Generate a CHANGELOG entry from recent git history.

## Instructions

Run the following to get the commit history since the last tag (or last N commits if no tags exist):

```bash
git tag --sort=-creatordate | head -1   # find the latest tag
git log <latest-tag>...HEAD --oneline   # commits since that tag
git log --oneline -20                   # fallback if no tags
```

If I specify a ref or date range, use that instead.

## What to produce

A CHANGELOG entry in [Keep a Changelog](https://keepachangelog.com) format:

```markdown
## [Unreleased] — YYYY-MM-DD

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Removed

- ...
```

Only include sections that have relevant commits. Omit empty sections.

## Grouping rules

Map conventional commit types to CHANGELOG sections:

- `feat:` → Added
- `fix:` → Fixed
- `refactor:`, `perf:` → Changed
- `docs:`, `chore:` → Changed (only if user-visible)
- `test:` → omit unless it signals a behaviour change
- Breaking changes → always call out explicitly at the top of the entry

Write entries as user-facing descriptions, not commit message rewrites. "Add Preact as a
frontend framework option" is better than "feat: add preact to FRONTEND_FRAMEWORKS array".

## Output

Print the entry first. Then ask whether to:

1. Append it to `CHANGELOG.md` (create the file if it doesn't exist)
2. Print only — the user will handle placement themselves

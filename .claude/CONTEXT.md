# Project Context — Comic Tracker

> This file is the living context for Claude Code sessions.
> Update it freely — it is never touched by the install-global or init scripts.
> Commit it regularly so context is preserved across machines and time.

---

## Current Focus

Stable. No active WIP. Hunt list feature and hidden publishers/series shipped.

---

## Active Decisions

- **Hunt list** (not "pull list") — renamed to avoid conflating with the comic-store pull list (upcoming-release subscription). Hunt list = curated shopping reference at a store/convention.
- **Express Router for hunt-lists** — `server/routes/huntLists.ts` is the first route migrated off the legacy `createRequestHandler` adapter pattern. All other routes still use the adapter; migration is incremental.
- **Committing directly to main** — project workflow; no branch-based PR flow currently in use.

---

## In Progress

- Nothing. All session work committed.

---

## Known Gotchas

- `dev-comics.db` is behind on migrations (only has the first two applied). Run `npm run db:migrate` to bring it current before testing hunt list or hidden features.
- The legacy Netlify-Functions adapter (`server/adapter.ts` + `createRequestHandler`) is still used by all routes except hunt-lists. When touching other routes, prefer the Express Router pattern.
- `prisma/dev-comics.db-shm` and `prisma/dev-comics.db-wal` were previously tracked in git; now correctly removed. If they reappear as modified, they can be ignored — `.gitignore` covers them.

---

## Next Up

- Migrate remaining routes (comics, favorites, hiddenPublishers, hiddenSeries, admin, alerts) from `createRequestHandler` adapter to Express Router, following the `huntLists.ts` pattern.

---

## Session Notes

<!-- Scratch space. Cleared between major milestones. -->

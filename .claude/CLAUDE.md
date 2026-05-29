# Claude Code — Project Steering File

> Extends: ~/.claude/CLAUDE.md — read that file before filling in this one.
> Only add overrides and project-specific context here; anything already defined globally does not need repeating.
> Project-level rules take precedence over global rules where they conflict.

---

## Project Overview

**Name:** Comic Tracker
**Description:** This is a PWA to help me track my comic book collection and want list.
**Type:** Full-stack <!-- e.g. API, CLI tool, full-stack app, library -->

---

## Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict)
- **Frontend:** React
- **Backend:** Express
- **Database:** SQLite <!-- e.g. PostgreSQL via Drizzle, SQLite, none -->
- **Testing:** Vitest <!-- e.g. Bun test, Vitest -->
- **Other key dependencies:**
  - `prisma` + `@prisma/adapter-better-sqlite3` + `better-sqlite3` — ORM with SQLite driver
  - `express` — HTTP server
  - `tsx` — runs the server directly from `.ts` source (dev and prod)
  - `dotenv` — env loading at server startup
  - `styled-components` — CSS-in-JS (client)
  - `idb` — IndexedDB wrapper for offline/PWA state (client)
  - `axios` — HTTP client for API calls (client)
  - `papaparse` — CSV parsing for bulk comic import (client)
  - `vite-plugin-pwa` — PWA manifest and service worker generation (client)

---

## Architecture

- `server/` — Express HTTP server. Mounts all `/api` routes and serves the React SPA from
  `client/dist`. Routes delegate via `server/adapter.ts` to handlers in `api/`.
- `api/` — Framework-agnostic handlers and business logic, organized by domain feature.
  Each domain has `handlers/` (parse request, shape response) and `services/` (pure logic).
  `api/utils/` holds the Prisma client singleton and CORS helpers.
  `api/types/` holds `ApiRouteEvent` and `UserContext` — the shared shapes for all handlers.
- `client/` — React SPA (Vite). All frontend code under `client/src/`. Calls `/api` via Axios;
  proxied to the API in dev, same-origin in prod.
- `prisma/` — SQLite schema and migration history. Client generated to
  `node_modules/.prisma/client`; regenerate after schema changes (`npm run db:generate`).
- `functions/` — empty, legacy from a prior Netlify Functions architecture. Unused; ignore it.

---

## Domain Language

- **Comic** — the primary entity. A single tracked issue (physical or want-list). Prefer "comic"
  over "issue" as the top-level term.
- **Issue** — the numbered publication within a series (e.g. "issue #12"). Use "comic" for the
  tracked record; "issue" only when referring to the publication number field.
- **Series** — the publisher/title/volume grouping. A series has many comics.
- **Want list** — comics where `collected: false`. Owned in intent, not yet in hand. Not "wish list."
- **Grail** — a high-priority want-list item (`isGrail: true`). Subjective: "I want this and will
  prioritize it." Covers key issues, first appearances, rare variants, or anything the user deems
  highly desirable.
- **Collected** — means owned / physically in the collection (`collected: true`).
- **Hunt list** — a named, curated set of series used as a shopping reference (e.g. at a comic store
  or convention). Selecting a hunt list opens Multi-Hunt: a tabbed view of want-list comics across
  each series in the set. A hunt-list entry tracks a series, not an individual comic. Distinct from
  both the want list (individual comics) and the traditional comic-store "pull list" (subscription
  to upcoming releases) — do not conflate the two.

---

## Key Data Models

**Comic** — single issue in the collection or want list
- Identity: `publisher`, `series`, `volume`, `issue`, `issueNumber`
- Ownership: `collected` (true = owned; false = want list), `pricePaid` (null = want-list item)
- Grail: `isGrail`, `grailReason`
- Condition: `grade`, `cert`, `certificationCompany`, `signed`, `gradeDetails`
- Financials: `currentValue`, `pricePaid`
- Creative team: `writer`, `artist`, `coverArtist`, `letterer`, `firstAppearance`
- `userId` → User (cascade delete). Multiple copies allowed per identifier — no unique constraint.

**User** — single-tenant; auto-created on first request from `DEFAULT_USER_EMAIL`
- Display prefs: `showHiddenPublishers`, `showHiddenSeries`. Always `isAdmin: true`. No login.

**FavoriteSeries** — bookmarked series (publisher + series + volume, unique per user)

**HuntList** — named, curated set of series for shopping reference
- Has many `HuntListSeries` (publisher + series + volume, unique per hunt list)

**HiddenPublisher** — a publisher suppressed from the main view (unique per user)

**HiddenSeries** — a specific series suppressed from the main view (publisher + series + volume, unique per user)

**AlertLog** — audit trail for system alerts dispatched via Telegram or email
- `severity`, `source`, `message`, `metadata` (JSON string), `telegramSent`, `emailSent`

---

## External Integrations

- **Telegram Bot API** — pushes system alert notifications. Optional; active only when
  `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set.
- **SendGrid** — sends email alert notifications. Optional; active only when
  `SENDGRID_API_KEY` + `ALERT_EMAIL_TO` are set.

Both are triggered exclusively via `POST /api/alerts` and log results to `AlertLog`.

---

## Conventions & Exceptions

<!-- Any project-specific deviations from the global CLAUDE.md.
  Example: "This project uses classes for database models due to the ORM." -->

- Skills with `scope: global` frontmatter are toolkit-only — they are deployed to `~/.claude/skills/` by `install-global` but not to this project by `init`. Use this tag for skills that are specific to working on the kit itself, not on projects built with the kit.

- **`event: any` in `api/` handlers** — legacy from Netlify Functions. The correct type is
  `ApiRouteEvent` from `server/adapter.ts`. Prefer it in new handlers; fix existing ones when
  touching them.
- **Prisma `PrismaClient`** — used as a singleton class (library requirement). Wrapped in
  `getPrisma()` and `withPrisma()` in `api/utils/db.ts` to keep call sites functional.
- **Module-level mutable state in `api/utils/db.ts`** — `prismaInstance` and the SQLite PRAGMA
  initialization are intentional singletons for connection lifecycle management. Do not refactor
  without understanding the WAL + `busy_timeout` setup.

---

## What Claude Should Never Touch

<!-- Files or directories that should not be modified without explicit instruction. -->

- `.env` and any secrets files
- `migrations/` — database migrations are written manually
- `prisma/schema.prisma` — schema changes must be paired with a new migration; never edit without also creating one
- `client/dist/` — build output; regenerated by `npm run build`

## AI Session Discipline

- Don't batch unrelated concerns into a single session. Review and fix loops (`/full-review`, `/review-implementer`) degrade in quality proportionally with diff size. Keep changes focused to one logical concern per session — prefer small, reviewable commits over large sweeping changes.

---

## Security Posture

- **Input trust boundary:** `server/routes/*.ts` — Express route handlers receive all untrusted input
  (JSON body via `express.json`, URL params, query strings). The `api/handlers/` layer handles
  parsing and validation.
- **Auth mechanism:** None — single-tenant app. All requests are automatically attributed to the
  default user (`DEFAULT_USER_EMAIL`). `getUserContext()` in `api/utils/db.ts` ignores the
  `Authorization` header (reserved for a future multi-user path).
- **Secret management:** `process.env` directly, loaded via `dotenv` from `.env` at server startup.
  No secrets manager.
- Run `/security-review` before merging anything that touches auth, input handling, or external API calls.

---

## Current Context

See `.claude/CONTEXT.md` for current focus, active decisions, and known gotchas.
Read that file at the start of every session before doing anything else.

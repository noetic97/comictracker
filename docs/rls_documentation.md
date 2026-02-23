# Authentication and data access

The app runs **local-first** with a single default user (single-tenant). There is no Row Level Security; all API operations are scoped to the default user in application code.

- **Default user:** Created automatically from `DEFAULT_USER_EMAIL` (env or `user@comictracker.local`). See `functions/utils/db.ts` (`ensureDefaultUser`).
- **Database:** SQLite via Prisma. No Supabase or Postgres.
- For multi-user in the future, add authentication (e.g. JWT) and pass `userId` from the token; the services already take `userId` for all queries.

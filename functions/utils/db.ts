import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { UserContext } from "../types/handlers";

let prismaInstance: PrismaClient | null = null;
let grailReasonColumnChecked = false;

/** One-shot PRAGMAs for file DBs: WAL improves read/write overlap; busy_timeout waits on locks (see initSqliteConcurrency). */
let sqlitePragmasPromise: Promise<void> | null = null;

function getAdapter() {
  const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev-comics.db";
  // better-sqlite3: ms to retry when the DB is locked before SQLITE_BUSY (default 5000).
  return new PrismaBetterSqlite3({ url: databaseUrl, timeout: 10_000 });
}

function startSqlitePragmasIfNeeded(prisma: PrismaClient): void {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("file:")) return;
  if (sqlitePragmasPromise) return;
  sqlitePragmasPromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`PRAGMA journal_mode=WAL;`);
      await prisma.$executeRawUnsafe(`PRAGMA busy_timeout=10000;`);
    } catch (err) {
      console.warn("SQLite WAL/busy_timeout setup failed:", err);
    }
  })();
}

/**
 * Await once so WAL + busy_timeout are applied before heavy traffic.
 * Safe to call from multiple places; subsequent calls resolve immediately.
 */
export async function initSqliteConcurrency(): Promise<void> {
  const prisma = getPrisma();
  startSqlitePragmasIfNeeded(prisma);
  if (sqlitePragmasPromise) await sqlitePragmasPromise;
}

/**
 * Ensure comics table has grailReason column (for DBs created before the migration).
 * Safe to call multiple times; runs at most once per process.
 */
async function ensureGrailReasonColumn(prisma: PrismaClient): Promise<void> {
  if (grailReasonColumnChecked) return;
  grailReasonColumnChecked = true;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE comics ADD COLUMN grailReason TEXT`
    );
    console.log("Added missing column: comics.grailReason");
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (msg.includes("duplicate column") || msg.includes("already exists")) {
      // Column already there
      return;
    }
    console.warn("ensureGrailReasonColumn:", msg);
  }
}

/**
 * Get a singleton Prisma client instance.
 */
export const getPrisma = (): PrismaClient => {
  if (!prismaInstance) {
    const adapter = getAdapter();
    prismaInstance = new PrismaClient({ adapter });
    startSqlitePragmasIfNeeded(prismaInstance);
  }
  return prismaInstance;
};

/**
 * Event-like shape (Netlify or Express adapter).
 */
export interface RequestLike {
  headers?: { authorization?: string; [k: string]: string | undefined };
}

/**
 * Get user context from the request (single-tenant: default user).
 */
export const getUserContext = async (
  eventOrReq: RequestLike
): Promise<UserContext> => {
  // Future: parse Authorization header for multi-user
  return ensureDefaultUser(getPrisma());
};

/**
 * Ensure default user exists and return context.
 */
async function ensureDefaultUser(prisma: PrismaClient): Promise<UserContext> {
  await initSqliteConcurrency();
  await ensureGrailReasonColumn(prisma);

  const defaultEmail =
    process.env.DEFAULT_USER_EMAIL || "user@comictracker.local";

  try {
    const existing = await prisma.user.findUnique({
      where: { email: defaultEmail },
      select: { id: true, email: true },
    });

    if (existing) {
      return {
        userId: existing.id,
        isAdmin: true,
        email: existing.email,
      };
    }

    console.log("Creating default user:", defaultEmail);
    const newUser = await prisma.user.create({
      data: {
        email: defaultEmail,
        displayName: "Default User",
        emailVerified: true,
        isActive: true,
      },
      select: { id: true, email: true },
    });

    console.log("Created default user:", newUser.email);
    return {
      userId: newUser.id,
      isAdmin: true,
      email: newUser.email,
    };
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("ensureDefaultUser failed:", msg, err);
    throw new Error(
      `Default user setup failed: ${msg}. Check DATABASE_URL (e.g. file:./prisma/dev.db) and that migrations have been run (npx prisma migrate deploy).`
    );
  }
}

/**
 * Wrapper for API handlers: resolve user context and run callback with Prisma + userContext.
 */
export const withPrisma = async <T>(
  eventOrReq: RequestLike,
  callback: (prisma: PrismaClient, userContext: UserContext) => Promise<T>
): Promise<T> => {
  const prisma = getPrisma();
  const userContext = await getUserContext(eventOrReq);
  console.log(
    `🔐 User context: ${userContext.email} (admin: ${userContext.isAdmin})`
  );
  return callback(prisma, userContext);
};

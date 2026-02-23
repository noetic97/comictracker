import { PrismaClient } from "@prisma/client";
import { UserContext } from "../types/handlers";

let prismaInstance: PrismaClient | null = null;

/**
 * Get a singleton Prisma client instance.
 */
export const getPrisma = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
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

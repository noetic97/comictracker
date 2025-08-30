import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __PRISMA__: PrismaClient | undefined;
}

// Reuse a single client across warm invocations
const prisma =
  globalThis.__PRISMA__ ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: process.env.DEPLOY_ENV === "local" ? ["error", "warn"] : ["error"],
    errorFormat: "minimal",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__PRISMA__ = prisma;
}

// Wrap business logic; do NOT disconnect on every request — let Lambda reuse the connection
export const withPrisma = async <T>(
  callback: (p: PrismaClient) => Promise<T>
): Promise<T> => {
  try {
    return await callback(prisma);
  } catch (err) {
    console.error("Prisma error:", err);
    throw err;
  }
};

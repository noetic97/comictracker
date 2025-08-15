import { PrismaClient } from "@prisma/client";

// Create a completely fresh client for each request to avoid prepared statement conflicts
export const withPrisma = async <T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Disable prepared statements to avoid race conditions
    log: ["error"],
    errorFormat: "minimal",
  });

  try {
    // Don't call $connect() explicitly - let Prisma handle it
    const result = await callback(prisma);
    return result;
  } catch (error) {
    console.error("Prisma error:", error);
    throw error;
  } finally {
    // Always disconnect to clean up
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }
  }
};

import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

// This is the ONLY export needed for Netlify functions
export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    if (httpMethod !== "DELETE") {
      return createErrorResponse(
        405,
        "Only DELETE method allowed for admin operations"
      );
    }

    return await withPrisma(async (prisma) => {
      console.log("🗑️ Starting database clear operation");

      // Get count before deletion for reporting
      const comicCount = await prisma.comic.count();
      console.log(`📊 Found ${comicCount} comics in database`);

      // Delete all comics
      const deleteResult = await prisma.comic.deleteMany({});

      console.log(`✅ Successfully deleted ${deleteResult.count} comics`);

      return createResponse(200, {
        message: `Successfully deleted all comics from database`,
        deletedCount: deleteResult.count,
        originalCount: comicCount,
      });
    });
  } catch (error: any) {
    console.error("❌ Admin clear database error:", error);
    return createErrorResponse(
      500,
      `Failed to clear database: ${error.message}`
    );
  }
};

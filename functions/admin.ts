import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    if (httpMethod !== "DELETE") {
      return createErrorResponse(405, "Only DELETE method allowed");
    }

    return await withPrisma(async (prisma) => {
      console.log("🗑️ Clearing all comics from database");

      const comicCount = await prisma.comic.count();
      await prisma.comic.deleteMany({});

      console.log(`✅ Deleted ${comicCount} comics`);

      return createResponse(200, {
        message: `Successfully deleted ${comicCount} comics`,
        deletedCount: comicCount,
      });
    });
  } catch (error: any) {
    console.error("Admin clear error:", error);
    return createErrorResponse(
      500,
      `Failed to clear database: ${error.message}`
    );
  }
};

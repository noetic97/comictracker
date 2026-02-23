/**
 * Admin API - Main router (slimmed down from ~100 lines to ~40 lines)
 * Delegates business logic to handlers and services
 */

import { withPrisma } from "./utils/db";
import { handleCors, createErrorResponse, HandlerResponse } from "./utils/cors";
import { handleClearDatabase, handleGetDatabaseStats } from "./handlers/admin";

/**
 * Main handler - routing only
 */
export const handler = async (event: any): Promise<HandlerResponse> => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    console.log(`📡 Admin API: ${httpMethod} ${event.path}`);

    return await withPrisma(event, async (prisma, userContext) => {
      switch (httpMethod) {
        case "DELETE":
          return await handleClearDatabase(
            prisma,
            userContext,
            event.queryStringParameters
          );

        case "GET":
          return await handleGetDatabaseStats(prisma, userContext);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("❌ Admin function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

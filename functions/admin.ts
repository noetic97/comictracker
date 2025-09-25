/**
 * Admin API - Main router (slimmed down from ~100 lines to ~40 lines)
 * Delegates business logic to handlers and services
 */

import { Handler } from "@netlify/functions";
import { withSupabaseRLS } from "./utils/supabase";
import { handleCors, createErrorResponse } from "./utils/cors";
import { handleClearDatabase, handleGetDatabaseStats } from "./handlers/admin";

/**
 * Main handler - routing only
 */
export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    console.log(`📡 Admin API: ${httpMethod} ${event.path}`);

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      switch (httpMethod) {
        case "DELETE":
          // Clear database operation
          return await handleClearDatabase(
            supabase,
            userContext,
            event.queryStringParameters
          );

        case "GET":
          // Get database statistics (future enhancement)
          return await handleGetDatabaseStats(supabase, userContext);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("❌ Admin function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

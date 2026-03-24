/**
 * Hidden publishers preference API (persisted; replaces localStorage-only).
 */

import { handleCors, createErrorResponse, HandlerResponse } from "./utils/cors";
import { withPrisma } from "./utils/db";
import {
  handleGetHiddenPublishers,
  handlePutHiddenPublishers,
} from "./handlers/hiddenPublishers";

export const handler = async (event: any): Promise<HandlerResponse> => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    return await withPrisma(event, async (prisma, userContext) => {
      if (httpMethod === "GET") {
        return handleGetHiddenPublishers(prisma, userContext.userId);
      }
      if (httpMethod === "PUT") {
        let body: unknown;
        try {
          body = JSON.parse(event.body || "{}");
        } catch {
          return createErrorResponse(400, "Invalid JSON body");
        }
        return handlePutHiddenPublishers(
          prisma,
          userContext.userId,
          body
        );
      }
      return createErrorResponse(405, "Method not allowed");
    });
  } catch (error: any) {
    console.error("Hidden publishers API error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

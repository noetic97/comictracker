/**
 * Hidden series preference API (persisted; replaces localStorage-only).
 */

import { handleCors, createErrorResponse, HandlerResponse } from "./utils/cors";
import { withPrisma } from "./utils/db";
import {
  handleGetHiddenSeries,
  handlePutHiddenSeries,
  handlePostHideCollectedSeries,
} from "./handlers/hiddenSeries";

function pathEndsWithHideCollected(event: { path?: string }): boolean {
  const p = (event.path || "").split("?")[0];
  return p === "/api/hidden-series/hide-collected" || p.endsWith("/hide-collected");
}

export const handler = async (event: any): Promise<HandlerResponse> => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod } = event;

    return await withPrisma(event, async (prisma, userContext) => {
      if (httpMethod === "POST" && pathEndsWithHideCollected(event)) {
        return handlePostHideCollectedSeries(prisma, userContext.userId);
      }
      if (httpMethod === "GET") {
        return handleGetHiddenSeries(prisma, userContext.userId);
      }
      if (httpMethod === "PUT") {
        let body: unknown;
        try {
          body = JSON.parse(event.body || "{}");
        } catch {
          return createErrorResponse(400, "Invalid JSON body");
        }
        return handlePutHiddenSeries(prisma, userContext.userId, body);
      }
      return createErrorResponse(405, "Method not allowed");
    });
  } catch (error: any) {
    console.error("Hidden series API error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

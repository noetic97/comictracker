/**
 * Comics API - Main router (slimmed down to ~50 lines)
 * Delegates business logic to handlers and services
 */

import { Handler } from "@netlify/functions";
import { handleCors, createErrorResponse } from "./utils/cors";
import { withSupabaseRLS } from "./utils/supabase";
import {
  getComicStats,
  getPublisherSummaries,
  getSeriesSummaries,
} from "./services/comics";
import {
  handleGetComics,
  handleCreateComic,
  handleUpdateComic,
  handleToggleAction,
  handleDeleteComic,
  handleBulkImport,
} from "./handlers/comics";

/**
 * Parse URL to extract comic ID and action
 */
const parseComicRoute = (path: string) => {
  const segments = path?.split("/").filter(Boolean) || [];

  // Handle different URL patterns:
  // /api/comics/stats, /api/comics/publishers, /api/comics/series, /api/comics/bulk
  // /api/comics/123, /api/comics/123/collect, /api/comics/123/grail

  if (segments.includes("stats")) return { isStats: true };
  if (segments.includes("publishers")) return { isPublishers: true };
  if (segments.includes("series")) return { isSeries: true };
  if (segments.includes("bulk")) return { isBulk: true };

  const comicsIndex = segments.findIndex((seg) => seg === "comics");
  if (comicsIndex === -1) return {};

  const comicId = segments[comicsIndex + 1];
  const action = segments[comicsIndex + 2];

  return { comicId, action };
};

/**
 * Main handler - routing only
 */
export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const route = parseComicRoute(path || "");

    console.log(`📡 Comics API: ${httpMethod} ${path}`);

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      // Handle aggregation endpoints using services
      if (route.isStats && httpMethod === "GET") {
        return await getComicStats(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isPublishers && httpMethod === "GET") {
        return await getPublisherSummaries(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isSeries && httpMethod === "GET") {
        return await getSeriesSummaries(
          supabase,
          userContext.userId,
          event.queryStringParameters
        );
      }

      // Handle bulk operations
      if (route.isBulk && httpMethod === "POST") {
        let body: any = {};
        try {
          body = event.body ? JSON.parse(event.body) : {};
        } catch {
          return createErrorResponse(400, "Invalid JSON body");
        }
        return await handleBulkImport(supabase, userContext.userId, body);
      }

      // Handle regular CRUD operations using handlers
      switch (httpMethod) {
        case "GET":
          return await handleGetComics(
            supabase,
            userContext.userId,
            event.queryStringParameters
          );

        case "POST":
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleCreateComic(supabase, userContext.userId, body);

        case "PATCH":
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }
          return await handleToggleAction(
            supabase,
            userContext.userId,
            route.comicId,
            route.action || ""
          );

        case "PUT":
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PUT operations"
            );
          }
          let updateBody: any = {};
          try {
            updateBody = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleUpdateComic(
            supabase,
            userContext.userId,
            route.comicId,
            updateBody
          );

        case "DELETE":
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for DELETE operations"
            );
          }
          return await handleDeleteComic(
            supabase,
            userContext.userId,
            route.comicId
          );

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Comics function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

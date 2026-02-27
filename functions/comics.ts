/**
 * Comics API - Main router (slimmed down to ~50 lines)
 * Delegates business logic to handlers and services
 */

import { handleCors, createErrorResponse, HandlerResponse } from "./utils/cors";
import { withPrisma } from "./utils/db";
import {
  getComicStats,
  getPublisherSummaries,
  getSeriesSummaries,
  getDistinctTypes,
} from "./services/comics/aggregationsService";
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
  if (segments.includes("types")) return { isTypes: true };
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
export const handler = async (event: any): Promise<HandlerResponse> => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const route = parseComicRoute(path || "");

    console.log(`📡 Comics API: ${httpMethod} ${path}`);

    return await withPrisma(event, async (prisma, userContext) => {
      // Handle aggregation endpoints using services
      if (route.isStats && httpMethod === "GET") {
        return await getComicStats(
          prisma,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isPublishers && httpMethod === "GET") {
        return await getPublisherSummaries(
          prisma,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isSeries && httpMethod === "GET") {
        return await getSeriesSummaries(
          prisma,
          userContext.userId,
          event.queryStringParameters
        );
      }

      if (route.isTypes && httpMethod === "GET") {
        return await getDistinctTypes(prisma, userContext.userId);
      }

      // Handle bulk operations
      if (route.isBulk && httpMethod === "POST") {
        let body: any = {};
        try {
          body = event.body ? JSON.parse(event.body) : {};
        } catch {
          return createErrorResponse(400, "Invalid JSON body");
        }
        return await handleBulkImport(prisma, userContext.userId, body);
      }

      // Handle regular CRUD operations using handlers
      switch (httpMethod) {
        case "GET":
          return await handleGetComics(
            prisma,
            userContext.userId,
            event.queryStringParameters,
            route.comicId
          );

        case "POST":
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleCreateComic(prisma, userContext.userId, body);

        case "PATCH":
          if (!route.comicId) {
            return createErrorResponse(
              400,
              "Comic ID required for PATCH operations"
            );
          }
          return await handleToggleAction(
            prisma,
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
            prisma,
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
            prisma,
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

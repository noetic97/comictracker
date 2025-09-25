/**
 * Favorites API - Main router (slimmed down from ~150 lines to ~60 lines)
 * Delegates business logic to handlers and services
 */

import { Handler } from "@netlify/functions";
import { handleCors, createErrorResponse } from "./utils/cors";
import { withSupabaseRLS } from "./utils/supabase";
import {
  handleGetFavorites,
  handleAddFavorite,
  handleRemoveFavorite,
  handleCheckFavorite,
  handleRemoveFavoriteByDetails,
} from "./handlers/favorites";

/**
 * Parse URL to extract favorite ID and check for special endpoints
 */
const parseFavoritesRoute = (path: string) => {
  const segments = path?.split("/").filter(Boolean) || [];

  // Handle different URL patterns:
  // /api/favorites
  // /api/favorites/check
  // /api/favorites/:id

  const isCheckEndpoint = path?.includes("/check");

  const favoritesIndex = segments.findIndex((seg) => seg === "favorites");
  if (favoritesIndex === -1) return {};

  const favoriteId = segments[favoritesIndex + 1];

  return { favoriteId, isCheckEndpoint };
};

/**
 * Main handler - routing only
 */
export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const { httpMethod, path } = event;
    const route = parseFavoritesRoute(path || "");

    console.log(`📡 Favorites API: ${httpMethod} ${path}`);

    return await withSupabaseRLS(event, async (supabase, userContext) => {
      switch (httpMethod) {
        case "GET":
          if (route.isCheckEndpoint) {
            // Check if a series is favorited
            return await handleCheckFavorite(
              supabase,
              userContext.userId,
              event.queryStringParameters
            );
          } else {
            // Get all favorites
            return await handleGetFavorites(supabase, userContext.userId);
          }

        case "POST":
          let body: any = {};
          try {
            body = event.body ? JSON.parse(event.body) : {};
          } catch {
            return createErrorResponse(400, "Invalid JSON body");
          }
          return await handleAddFavorite(supabase, userContext.userId, body);

        case "DELETE":
          if (route.favoriteId) {
            // Remove by ID
            return await handleRemoveFavorite(
              supabase,
              userContext.userId,
              route.favoriteId
            );
          } else {
            // Remove by series details (body contains publisher/series/volume)
            let deleteBody: any = {};
            try {
              deleteBody = event.body ? JSON.parse(event.body) : {};
            } catch {
              return createErrorResponse(400, "Invalid JSON body");
            }
            return await handleRemoveFavoriteByDetails(
              supabase,
              userContext.userId,
              deleteBody
            );
          }

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    });
  } catch (error: any) {
    console.error("Favorites function error:", error);
    return createErrorResponse(500, `Internal server error: ${error.message}`);
  }
};

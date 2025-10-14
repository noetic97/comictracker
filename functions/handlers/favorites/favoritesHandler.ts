/**
 * Favorites Handler - Business logic layer for favorite series operations
 * Extracted from functions/favorites.ts for better separation of concerns
 * Handles HTTP request/response logic and delegates to services
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  getAllFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteExists,
  removeFavoriteByDetails,
  validateFavoriteInput,
} from "../../services/favorites/favoritesService";
import { FavoriteSeriesData } from "../../types/services";
import { transformFromDatabase } from "../../utils/supabase";

/**
 * Handle GET requests for favorites
 */
export const handleGetFavorites = async (
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const favorites = await getAllFavorites(supabase, userId);

    // Transform for frontend (convert user_id to userId, etc.)
    const transformedFavorites = favorites.map(transformFromDatabase);

    return createResponse(200, transformedFavorites);
  } catch (error: any) {
    console.error("Get favorites error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle POST requests for adding favorites
 */
export const handleAddFavorite = async (
  supabase: SupabaseClient,
  userId: string,
  body: any
) => {
  try {
    // Validate input
    const validationErrors = validateFavoriteInput(body);
    if (validationErrors.length > 0) {
      return createResponse(422, {
        error: "Validation failed",
        errors: validationErrors,
      });
    }

    // Normalize volume field
    const favoriteData: FavoriteSeriesData = {
      publisher: body.publisher.trim(),
      series: body.series.trim(),
      volume: (body.volume || "").trim(),
    };

    const newFavorite = await addFavorite(supabase, userId, favoriteData);

    // Transform for frontend
    const transformedFavorite = transformFromDatabase(newFavorite);

    return createResponse(201, transformedFavorite);
  } catch (error: any) {
    console.error("Add favorite error:", error);

    if (
      error.message.includes("duplicate key") ||
      error.message.includes("already exists")
    ) {
      return createErrorResponse(
        409,
        "This series is already in your favorites"
      );
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle DELETE requests for removing favorites by ID
 */
export const handleRemoveFavorite = async (
  supabase: SupabaseClient,
  userId: string,
  favoriteId: string
) => {
  try {
    await removeFavorite(supabase, userId, favoriteId);
    return createResponse(204, null);
  } catch (error: any) {
    console.error("Remove favorite error:", error);

    if (error.message.includes("not found")) {
      return createErrorResponse(404, "Favorite not found");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle GET requests for checking if a series is favorited
 */
export const handleCheckFavorite = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
) => {
  try {
    const { publisher, series, volume = "" } = queryParams || {};

    if (!publisher || !series) {
      return createErrorResponse(
        400,
        "Publisher and series parameters required for check"
      );
    }

    const favoriteData: FavoriteSeriesData = {
      publisher,
      series,
      volume,
    };

    const result = await checkFavoriteExists(supabase, userId, favoriteData);

    // Transform favorite if it exists
    const transformedResult = {
      ...result,
      favorite: result.favorite
        ? transformFromDatabase(result.favorite)
        : undefined,
    };

    return createResponse(200, transformedResult);
  } catch (error: any) {
    console.error("Check favorite error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle DELETE requests for removing favorites by series details
 */
export const handleRemoveFavoriteByDetails = async (
  supabase: SupabaseClient,
  userId: string,
  body: any
) => {
  try {
    // Validate input
    const validationErrors = validateFavoriteInput(body);
    if (validationErrors.length > 0) {
      return createResponse(422, {
        error: "Validation failed",
        errors: validationErrors,
      });
    }

    const favoriteData: FavoriteSeriesData = {
      publisher: body.publisher.trim(),
      series: body.series.trim(),
      volume: (body.volume || "").trim(),
    };

    await removeFavoriteByDetails(supabase, userId, favoriteData);
    return createResponse(204, null);
  } catch (error: any) {
    console.error("Remove favorite by details error:", error);

    if (error.message.includes("not found")) {
      return createErrorResponse(404, "Favorite not found");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Favorites Handler - Business logic layer for favorite series operations
 * HTTP-facing favorites (delegates to services).
 * Handles HTTP request/response logic and delegates to services
 */

import { PrismaClient } from "@prisma/client";
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

/**
 * Handle GET requests for favorites
 */
export const handleGetFavorites = async (
  prisma: PrismaClient,
  userId: string
) => {
  try {
    const favorites = await getAllFavorites(prisma, userId);
    return createResponse(200, favorites);
  } catch (error: any) {
    console.error("Get favorites error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle POST requests for adding favorites
 */
export const handleAddFavorite = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
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

    const newFavorite = await addFavorite(prisma, userId, favoriteData);
    return createResponse(201, newFavorite);
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
  prisma: PrismaClient,
  userId: string,
  favoriteId: string
) => {
  try {
    await removeFavorite(prisma, userId, favoriteId);
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
  prisma: PrismaClient,
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

    const result = await checkFavoriteExists(prisma, userId, favoriteData);
    return createResponse(200, result);
  } catch (error: any) {
    console.error("Check favorite error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle DELETE requests for removing favorites by series details
 */
export const handleRemoveFavoriteByDetails = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
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

    await removeFavoriteByDetails(prisma, userId, favoriteData);
    return createResponse(204, null);
  } catch (error: any) {
    console.error("Remove favorite by details error:", error);

    if (error.message.includes("not found")) {
      return createErrorResponse(404, "Favorite not found");
    }

    return createErrorResponse(500, error.message);
  }
};

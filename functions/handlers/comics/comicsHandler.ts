/**
 * Comics Handler - Business logic layer for comic operations
 * Extracted from functions/comics.ts for better separation of concerns
 * Handles HTTP request/response logic and delegates to services
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  queryComics,
  createComic,
  updateComic,
  toggleComicField,
  deleteComic,
} from "../../services/comics/comicsService";
import { ComicQueryOptions } from "../../types/services";

/**
 * Handle GET requests for comics with filtering and pagination
 */
export const handleGetComics = async (
  supabase: SupabaseClient,
  userId: string,
  queryParams: any
) => {
  try {
    const result = await queryComics(
      supabase,
      userId,
      queryParams as ComicQueryOptions
    );
    return createResponse(200, result);
  } catch (error: any) {
    console.error("Get comics error:", error);
    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle POST requests for creating comics
 */
export const handleCreateComic = async (
  supabase: SupabaseClient,
  userId: string,
  body: any
) => {
  try {
    const newComic = await createComic(supabase, userId, body);
    return createResponse(201, newComic);
  } catch (error: any) {
    console.error("Create comic error:", error);

    // Check if it's a validation error
    if (error.message.includes("Validation failed")) {
      return createResponse(422, {
        error: "Validation failed",
        errors: error.message.split(": ")[1]?.split(", ") || [error.message],
      });
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle PUT requests for updating comics
 */
export const handleUpdateComic = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string,
  body: any
) => {
  try {
    const updatedComic = await updateComic(supabase, userId, comicId, body);
    return createResponse(200, updatedComic);
  } catch (error: any) {
    console.error("Update comic error:", error);

    if (error.message.includes("Comic not found")) {
      return createErrorResponse(404, "Comic not found");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle PATCH requests for toggle operations (collect/grail)
 */
export const handleToggleAction = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string,
  action: string
) => {
  try {
    let field: "collected" | "isGrail";

    if (action === "collect") {
      field = "collected";
    } else if (action === "grail") {
      field = "isGrail";
    } else {
      return createErrorResponse(
        400,
        "Invalid action. Use 'collect' or 'grail'"
      );
    }

    const updatedComic = await toggleComicField(
      supabase,
      userId,
      comicId,
      field
    );
    return createResponse(200, updatedComic);
  } catch (error: any) {
    console.error("Toggle comic error:", error);

    if (error.message.includes("Comic not found")) {
      return createErrorResponse(404, "Comic not found");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle DELETE requests for deleting comics
 */
export const handleDeleteComic = async (
  supabase: SupabaseClient,
  userId: string,
  comicId: string
) => {
  try {
    await deleteComic(supabase, userId, comicId);
    return createResponse(204, null);
  } catch (error: any) {
    console.error("Delete comic error:", error);

    if (error.message.includes("Comic not found")) {
      return createErrorResponse(404, "Comic not found");
    }

    return createErrorResponse(500, error.message);
  }
};

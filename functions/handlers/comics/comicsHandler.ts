/**
 * Comics Handler - Business logic layer for comic operations
 * Extracted from functions/comics.ts for better separation of concerns
 * Handles HTTP request/response logic and delegates to services
 */

import { PrismaClient } from "@prisma/client";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  queryComics,
  createComic,
  updateComic,
  toggleComicField,
  deleteComic,
  getComicById,
} from "../../services/comics/comicsService";
import { ComicQueryOptions } from "../../types/services";

/**
 * Handle GET requests for comics with filtering and pagination, or single comic by ID
 */
export const handleGetComics = async (
  prisma: PrismaClient,
  userId: string,
  queryParams: any,
  comicId?: string
) => {
  try {
    if (comicId) {
      const comic = await getComicById(prisma, userId, comicId);
      if (!comic) return createErrorResponse(404, "Comic not found");
      return createResponse(200, comic);
    }
    const result = await queryComics(
      prisma,
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
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const newComic = await createComic(prisma, userId, body);
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
  prisma: PrismaClient,
  userId: string,
  comicId: string,
  body: any
) => {
  try {
    const updatedComic = await updateComic(prisma, userId, comicId, body);
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
  prisma: PrismaClient,
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
      prisma,
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
  prisma: PrismaClient,
  userId: string,
  comicId: string
) => {
  try {
    await deleteComic(prisma, userId, comicId);
    return createResponse(204, null);
  } catch (error: any) {
    console.error("Delete comic error:", error);

    if (error.message.includes("Comic not found")) {
      return createErrorResponse(404, "Comic not found");
    }

    return createErrorResponse(500, error.message);
  }
};

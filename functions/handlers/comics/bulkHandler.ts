/**
 * Bulk Handler - Business logic layer for bulk comic operations
 * Extracted from functions/comics/bulkOperations.ts for better separation of concerns
 * Handles HTTP request/response logic and delegates to services
 */

import { PrismaClient } from "@prisma/client";
import { createResponse, createErrorResponse } from "../../utils/cors";
import {
  processBulkImport,
  processBulkUpdate,
  processBulkDelete,
} from "../../services/comics/bulkService";
import { BulkImportOptions } from "../../types/services";

/**
 * Handle POST requests for bulk comic imports
 */
export const handleBulkImport = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const { comics: comicsToCreate, options = {} } = body;

    if (!Array.isArray(comicsToCreate)) {
      return createErrorResponse(
        400,
        "Request body must contain 'comics' array"
      );
    }

    if (comicsToCreate.length === 0) {
      return createErrorResponse(400, "Comics array cannot be empty");
    }

    if (comicsToCreate.length > 10000) {
      return createErrorResponse(400, "Maximum 10,000 comics per bulk import");
    }

    console.log(
      `📦 [BULK] Import requested: ${comicsToCreate.length} comics for user ${userId} (using createMany, not upsert)`
    );

    const importOptions: BulkImportOptions = {
      validateComics: true,
      skipDuplicates: true,
      reportDetails: true,
      ...options,
    };

    const result = await processBulkImport(
      prisma,
      userId,
      comicsToCreate,
      importOptions
    );

    return createResponse(201, result);
  } catch (error: any) {
    console.error("Bulk import error:", error?.message ?? error);
    console.error("Bulk import error stack:", error?.stack);
    if (error?.meta) console.error("Bulk import error meta:", error.meta);
    if (error?.code) console.error("Bulk import error code:", error.code);

    if (error?.message?.includes("Validation failed")) {
      return createResponse(422, {
        error: "Validation failed",
        errors: error.message.split(": ")[1]?.split(", ") || [error.message],
      });
    }

    if (error.message.includes("Maximum")) {
      return createErrorResponse(413, error.message);
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle PUT requests for bulk comic updates
 * Future implementation for bulk status changes, bulk edits, etc.
 */
export const handleBulkUpdate = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return createErrorResponse(
        400,
        "Request body must contain 'updates' array"
      );
    }

    console.log(
      `🔄 Bulk update requested: ${updates.length} updates for user ${userId}`
    );

    const result = await processBulkUpdate(prisma, userId, updates);
    return createResponse(200, result);
  } catch (error: any) {
    console.error("Bulk update error:", error);

    if (error.message.includes("not yet implemented")) {
      return createErrorResponse(501, "Bulk updates not yet implemented");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle DELETE requests for bulk comic deletion
 * Future implementation for clearing collections, deleting by criteria, etc.
 */
export const handleBulkDelete = async (
  prisma: PrismaClient,
  userId: string,
  body: any
) => {
  try {
    const { criteria } = body;

    if (!criteria) {
      return createErrorResponse(
        400,
        "Request body must contain 'criteria' object"
      );
    }

    console.log(`🗑️ Bulk delete requested for user ${userId}:`, criteria);

    const result = await processBulkDelete(prisma, userId, criteria);
    return createResponse(200, result);
  } catch (error: any) {
    console.error("Bulk delete error:", error);

    if (error.message.includes("not yet implemented")) {
      return createErrorResponse(501, "Bulk deletes not yet implemented");
    }

    return createErrorResponse(500, error.message);
  }
};

/**
 * Handle GET requests for bulk operation status
 * Future implementation for tracking long-running bulk operations
 */
export const handleBulkStatus = async (
  _prisma: PrismaClient,
  _userId: string,
  operationId: string
) => {
  try {
    // Future: Track bulk operation status in database
    // This could be useful for very large imports that run asynchronously

    return createResponse(501, {
      error: "Bulk operation status tracking not yet implemented",
      operationId,
    });
  } catch (error: any) {
    console.error("Bulk status error:", error);
    return createErrorResponse(500, error.message);
  }
};

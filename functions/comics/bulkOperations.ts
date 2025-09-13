import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../utils/cors";
import { validateComicBatch } from "./validation";

export interface BulkImportResult {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  message: string;
  processingTime: number;
  rate: number;
  validationErrors?: string[];
}

/**
 * Handle bulk comic creation/update operations
 */
export const handleBulkImport = async (
  body: any,
  supabase: SupabaseClient,
  userId: string
): Promise<any> => {
  const { comics: comicsToCreate } = body;

  console.log(
    `🚀 Starting bulk import of ${
      comicsToCreate?.length || 0
    } comics for user ${userId}`
  );
  const startTime = Date.now();

  // Validate the bulk request
  const validation = validateComicBatch(comicsToCreate);

  if (
    validation.validationErrors.length &&
    validation.validComics.length === 0
  ) {
    return createResponse(422, {
      error: "Validation failed",
      errors: validation.validationErrors.slice(0, 50),
    });
  }

  // Add user_id to all valid comics (database uses snake_case for this field)
  const comicsWithUser = validation.validComics.map((comic) => ({
    ...comic,
    user_id: userId, // Database column is "user_id" (snake_case)
  }));

  console.log(`✅ Validated ${comicsWithUser.length} comics for bulk insert`);

  try {
    // Bulk insert with Supabase
    const { data: insertedComics, error: insertError } = await supabase
      .from("comics")
      .insert(comicsWithUser)
      .select();

    if (insertError) {
      console.error("Bulk insert error:", insertError);
      return createErrorResponse(
        500,
        `Bulk insert failed: ${insertError.message}`
      );
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const created = insertedComics?.length || 0;

    console.log(
      `🎉 Bulk import completed: ${created} comics created in ${totalTime}ms`
    );

    const result: BulkImportResult = {
      processed: validation.validComics.length,
      created,
      updated: 0, // For now, we only create in bulk operations
      errors: validation.validationErrors.length,
      message: `Bulk import: ${created} comics created`,
      processingTime: totalTime,
      rate: Math.round(created / (totalTime / 1000)),
      validationErrors: validation.validationErrors.slice(0, 10),
    };

    return createResponse(201, result);
  } catch (error: any) {
    console.error("Bulk import failed:", error);
    return createErrorResponse(500, `Bulk import failed: ${error.message}`);
  }
};

/**
 * Handle bulk comic updates (for future use)
 */
export const handleBulkUpdate = async (
  body: any,
  supabase: SupabaseClient,
  userId: string
): Promise<any> => {
  // Future implementation for bulk updates
  // This could be used for bulk status changes, bulk edits, etc.
  return createErrorResponse(501, "Bulk updates not yet implemented");
};

/**
 * Handle bulk comic deletion (for future use)
 */
export const handleBulkDelete = async (
  body: any,
  supabase: SupabaseClient,
  userId: string
): Promise<any> => {
  // Future implementation for bulk deletes
  // This could be used for clearing collections, deleting by criteria, etc.
  return createErrorResponse(501, "Bulk deletes not yet implemented");
};

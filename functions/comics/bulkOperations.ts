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
 * FIXED: Uses correct database field names (camelCase)
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

  // BYPASS ALL TRANSFORMATIONS - use exact database field names
  const comicsWithUser = validation.validComics.map((comic) => {
    console.log({ comic });

    // Remove any snake_case fields that might have been created by old code
    const cleanComic = {
      // Core fields (exact database column names)
      publisher: comic.publisher,
      series: comic.series,
      volume: comic.volume || "",
      years: comic.years || "",
      type: comic.type || "",
      issue: comic.issue,
      issueNumber: comic.issueNumber || 1, // camelCase

      // Financial fields (exact database column names)
      currentValue: comic.currentValue || 0, // camelCase
      pricePaid: comic.pricePaid || null, // camelCase

      // Physical/ownership fields (exact database column names)
      grade: comic.grade || null,
      gradeDetails: comic.gradeDetails || null, // camelCase
      storageLocation: comic.storageLocation || null, // camelCase
      notes: comic.notes || null,
      cert: comic.cert || null,
      signed: Boolean(comic.signed),
      variantDetails: comic.variantDetails || null, // camelCase

      // Date fields (exact database column names)
      dateAdded: comic.dateAdded || null, // camelCase
      issueDate: comic.issueDate || null, // camelCase
      datePurchased: comic.datePurchased || null, // camelCase

      // Creative team fields (exact database column names)
      storyTitle: comic.storyTitle || null, // camelCase
      description: comic.description || null,
      writer: comic.writer || null,
      artist: comic.artist || null,
      coverArtist: comic.coverArtist || null, // camelCase
      letterer: comic.letterer || null,
      firstAppearance: comic.firstAppearance || null, // camelCase
      coverImageUrl: comic.coverImageUrl || null, // camelCase
      certificationCompany: comic.certificationCompany || null, // camelCase

      // User state (exact database column names)
      collected: Boolean(comic.collected),
      isGrail: Boolean(comic.isGrail), // camelCase

      // System fields
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Foreign key (only field that's snake_case)
      user_id: userId,
    };

    console.log({ cleanComic });

    return cleanComic;
  });

  // DEDUPLICATE comics before sending to database
  const deduplicatedComics: typeof comicsWithUser = [];
  const seen = new Set();

  for (const comic of comicsWithUser) {
    // Create unique key based on the database constraint
    const uniqueKey = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      deduplicatedComics.push(comic);
    } else {
      console.log(
        `🔄 Skipping duplicate comic: ${comic.publisher} - ${comic.series} #${comic.issue}`
      );
    }
  }

  const duplicatesSkipped = comicsWithUser.length - deduplicatedComics.length;

  console.log(
    `✅ Deduplicated comics: ${deduplicatedComics.length} unique, ${duplicatesSkipped} duplicates skipped`
  );
  console.log(
    `🔍 Sample comic field names:`,
    Object.keys(deduplicatedComics[0] || {})
  );
  console.log(
    `📋 Sample comic data:`,
    JSON.stringify(deduplicatedComics[0], null, 2)
  );

  try {
    // Use UPSERT with deduplicated data
    const { data: insertedComics, error: insertError } = await supabase
      .from("comics")
      .upsert(deduplicatedComics, {
        onConflict: "publisher,series,volume,issue,type,user_id",
        ignoreDuplicates: false, // Update existing records instead of ignoring
      })
      .select();

    if (insertError) {
      console.error("Bulk upsert error:", insertError);
      console.error(
        "Sample data being inserted:",
        JSON.stringify(deduplicatedComics[0], null, 2)
      );
      return createErrorResponse(
        500,
        `Bulk upsert failed: ${insertError.message}`
      );
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const processed = insertedComics?.length || 0;

    console.log(
      `🎉 Bulk import completed: ${processed} comics processed, ${duplicatesSkipped} duplicates skipped, completed in ${totalTime}ms`
    );

    const result: BulkImportResult = {
      processed: deduplicatedComics.length,
      created: processed, // With upsert, we can't easily distinguish created vs updated
      updated: 0, // Would need more complex logic to track this
      errors: validation.validationErrors.length + duplicatesSkipped,
      message: `Bulk import: ${processed} comics processed, ${duplicatesSkipped} duplicates in file skipped`,
      processingTime: totalTime,
      rate: Math.round(processed / (totalTime / 1000)),
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

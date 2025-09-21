import { SupabaseClient } from "@supabase/supabase-js";
import { createResponse, createErrorResponse } from "../utils/cors";
import { validateComicBatch } from "./validation";
import { Comic } from "../../client/src/types/comic";

export interface BulkImportResult {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  message: string;
  processingTime: number;
  rate: number;
  validationErrors?: string[];
  duplicatesSkipped?: number;
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
  const comicsWithUser = validation.validComics.map((comic: Comic) => {
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

  // FIRST: Check which comics already exist in database to distinguish created vs updated
  const existingComicsQuery = await supabase
    .from("comics")
    .select("publisher,series,volume,issue,type")
    .eq("user_id", userId);

  const existingComicsSet = new Set();
  if (existingComicsQuery.data) {
    existingComicsQuery.data.forEach((comic) => {
      const key = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;
      existingComicsSet.add(key);
    });
  }

  // Separate comics into new vs existing
  const comicsToUpdate: typeof deduplicatedComics = [];
  const newComics: typeof deduplicatedComics = [];

  deduplicatedComics.forEach((comic) => {
    const key = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;
    if (existingComicsSet.has(key)) {
      comicsToUpdate.push(comic);
    } else {
      newComics.push(comic);
    }
  });

  console.log(
    `📊 Import breakdown: ${newComics.length} new, ${comicsToUpdate.length} updates, ${duplicatesSkipped} file duplicates skipped`
  );

  try {
    // Use UPSERT with deduplicated data
    const { data: insertedComics, error: insertError } = await supabase
      .from("comics")
      .upsert(deduplicatedComics, {
        onConflict: "publisher,series,volume,issue,type,user_id",
        ignoreDuplicates: false, // Update existing records
      })
      .select();

    if (insertError) {
      console.error("Bulk upsert error:", insertError);
      return createErrorResponse(
        500,
        `Bulk upsert failed: ${insertError.message}`
      );
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const processed = insertedComics?.length || 0;

    // FIXED: Proper reporting of created vs updated vs duplicates
    const result: BulkImportResult = {
      processed: processed,
      created: newComics.length, // NEW: Actual new comics
      updated: comicsToUpdate.length, // NEW: Actual updated comics
      errors: validation.validationErrors.length, // FIXED: Don't count duplicates as errors
      message: buildImportMessage(
        newComics.length,
        comicsToUpdate.length,
        duplicatesSkipped
      ),
      processingTime: totalTime,
      rate: Math.round(processed / (totalTime / 1000)),
      validationErrors: validation.validationErrors.slice(0, 10),
      duplicatesSkipped, // NEW: Report duplicates separately
    };

    console.log(
      `🎉 Import complete: ${result.created} created, ${result.updated} updated, ${duplicatesSkipped} duplicates skipped`
    );

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

/**
 * Build a descriptive message for import results
 */
function buildImportMessage(
  created: number,
  updated: number,
  duplicatesSkipped: number
): string {
  const parts: string[] = [];

  if (created > 0) parts.push(`${created} created`);
  if (updated > 0) parts.push(`${updated} updated`);
  if (duplicatesSkipped > 0)
    parts.push(`${duplicatesSkipped} duplicates skipped`);

  return parts.length > 0 ? parts.join(", ") : "No changes made";
}

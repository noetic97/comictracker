/**
 * Bulk Service - Core data access layer for bulk comic operations
 * Extracted from functions/comics/bulkOperations.ts for better separation of concerns
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { validateComicBatch } from "../../comics/validation";

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

export interface BulkImportOptions {
  validateComics?: boolean;
  skipDuplicates?: boolean;
  reportDetails?: boolean;
}

/**
 * Process bulk comic import with validation, deduplication, and proper created/updated tracking
 */
export const processBulkImport = async (
  supabase: SupabaseClient,
  userId: string,
  comicsToCreate: any[],
  options: BulkImportOptions = {}
): Promise<BulkImportResult> => {
  const {
    validateComics = true,
    skipDuplicates = true,
    reportDetails = true,
  } = options;

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
    throw new Error(
      `Validation failed: ${validation.validationErrors.slice(0, 5).join(", ")}`
    );
  }

  // Process and clean comics data
  const processedComics = await processComicsForDatabase(
    validation.validComics,
    userId
  );

  // Deduplicate comics within the file if requested
  const { deduplicatedComics, duplicatesSkipped } = skipDuplicates
    ? deduplicateComics(processedComics)
    : { deduplicatedComics: processedComics, duplicatesSkipped: 0 };

  if (reportDetails) {
    console.log(
      `✅ Processed comics: ${deduplicatedComics.length} unique, ${duplicatesSkipped} file duplicates skipped`
    );
    logSampleComic(deduplicatedComics[0]);
  }

  // Determine which comics are new vs existing
  const { newComics, existingComics } = await categorizeComics(
    supabase,
    userId,
    deduplicatedComics
  );

  if (reportDetails) {
    console.log(
      `📊 Import breakdown: ${newComics.length} new, ${existingComics.length} updates`
    );
  }

  // Perform the database upsert
  const upsertResult = await performBulkUpsert(supabase, deduplicatedComics);

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const processed = upsertResult.insertedComics?.length || 0;

  const result: BulkImportResult = {
    processed: processed,
    created: newComics.length,
    updated: existingComics.length,
    errors: validation.validationErrors.length,
    message: buildImportMessage(
      newComics.length,
      existingComics.length,
      duplicatesSkipped
    ),
    processingTime: totalTime,
    rate: Math.round(processed / (totalTime / 1000)),
    validationErrors: validation.validationErrors.slice(0, 10),
    duplicatesSkipped,
  };

  console.log(
    `🎉 Import complete: ${result.created} created, ${result.updated} updated, ${duplicatesSkipped} file duplicates skipped`
  );

  return result;
};

/**
 * Process and clean comics data for database insertion
 */
const processComicsForDatabase = async (
  validComics: any[],
  userId: string
): Promise<any[]> => {
  return validComics.map((comic: any) => ({
    // Core fields (exact database column names)
    publisher: comic.publisher,
    series: comic.series,
    volume: comic.volume || "",
    years: comic.years || "",
    type: comic.type || "",
    issue: comic.issue,
    issueNumber: comic.issueNumber || 1,

    // Financial fields (exact database column names)
    currentValue: comic.currentValue || 0,
    pricePaid: comic.pricePaid || null,

    // Physical/ownership fields (exact database column names)
    grade: comic.grade || null,
    gradeDetails: comic.gradeDetails || null,
    storageLocation: comic.storageLocation || null,
    notes: comic.notes || null,
    cert: comic.cert || null,
    signed: Boolean(comic.signed),
    variantDetails: comic.variantDetails || null,

    // Date fields (exact database column names)
    dateAdded: comic.dateAdded || null,
    issueDate: comic.issueDate || null,
    datePurchased: comic.datePurchased || null,

    // Creative team fields (exact database column names)
    storyTitle: comic.storyTitle || null,
    description: comic.description || null,
    writer: comic.writer || null,
    artist: comic.artist || null,
    coverArtist: comic.coverArtist || null,
    letterer: comic.letterer || null,
    firstAppearance: comic.firstAppearance || null,
    coverImageUrl: comic.coverImageUrl || null,
    certificationCompany: comic.certificationCompany || null,

    // User state (exact database column names)
    collected: Boolean(comic.collected),
    isGrail: Boolean(comic.isGrail),

    // System fields
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Foreign key (only field that's snake_case)
    user_id: userId,
  }));
};

/**
 * Remove duplicate comics within the import batch
 */
const deduplicateComics = (comics: any[]) => {
  const deduplicatedComics: any[] = [];
  const seen = new Set();
  let duplicatesSkipped = 0;

  for (const comic of comics) {
    // Create unique key based on the database constraint
    const uniqueKey = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      deduplicatedComics.push(comic);
    } else {
      duplicatesSkipped++;
      console.log(
        `🔄 Skipping duplicate comic: ${comic.publisher} - ${comic.series} #${comic.issue}`
      );
    }
  }

  return { deduplicatedComics, duplicatesSkipped };
};

/**
 * Categorize comics as new vs existing in the database
 */
const categorizeComics = async (
  supabase: SupabaseClient,
  userId: string,
  comics: any[]
) => {
  // Get existing comics for comparison
  const existingComicsQuery = await supabase
    .from("comics")
    .select("publisher,series,volume,issue,type")
    .eq("user_id", userId);

  if (existingComicsQuery.error) {
    console.error("Error fetching existing comics:", existingComicsQuery.error);
    throw new Error(
      `Failed to check existing comics: ${existingComicsQuery.error.message}`
    );
  }

  const existingComicsSet = new Set();
  if (existingComicsQuery.data) {
    existingComicsQuery.data.forEach((comic) => {
      const key = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;
      existingComicsSet.add(key);
    });
  }

  // Separate comics into new vs existing
  const existingComics: any[] = [];
  const newComics: any[] = [];

  comics.forEach((comic) => {
    const key = `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`;
    if (existingComicsSet.has(key)) {
      existingComics.push(comic);
    } else {
      newComics.push(comic);
    }
  });

  return { newComics, existingComics };
};

/**
 * Perform the actual database upsert operation
 */
const performBulkUpsert = async (supabase: SupabaseClient, comics: any[]) => {
  const { data: insertedComics, error: insertError } = await supabase
    .from("comics")
    .upsert(comics, {
      onConflict: "publisher,series,volume,issue,type,user_id",
      ignoreDuplicates: false, // Update existing records
    })
    .select();

  if (insertError) {
    console.error("Bulk upsert error:", insertError);
    throw new Error(`Bulk upsert failed: ${insertError.message}`);
  }

  return { insertedComics };
};

/**
 * Build a descriptive message for import results
 */
const buildImportMessage = (
  created: number,
  updated: number,
  duplicatesSkipped: number
): string => {
  const parts: string[] = [];

  if (created > 0) parts.push(`${created} created`);
  if (updated > 0) parts.push(`${updated} updated`);
  if (duplicatesSkipped > 0)
    parts.push(`${duplicatesSkipped} duplicates skipped`);

  return parts.length > 0 ? parts.join(", ") : "No changes made";
};

/**
 * Log sample comic data for debugging
 */
const logSampleComic = (comic: any) => {
  if (comic) {
    console.log(`🔍 Sample comic field names:`, Object.keys(comic));
    console.log(`📋 Sample comic data:`, JSON.stringify(comic, null, 2));
  }
};

/**
 * Handle bulk comic updates (placeholder for future implementation)
 */
export const processBulkUpdate = async (
  supabase: SupabaseClient,
  userId: string,
  updates: any[]
): Promise<BulkImportResult> => {
  // Future implementation for bulk updates
  // This could be used for bulk status changes, bulk edits, etc.
  throw new Error("Bulk updates not yet implemented");
};

/**
 * Handle bulk comic deletion (placeholder for future implementation)
 */
export const processBulkDelete = async (
  supabase: SupabaseClient,
  userId: string,
  criteria: any
): Promise<BulkImportResult> => {
  // Future implementation for bulk deletes
  // This could be used for clearing collections, deleting by criteria, etc.
  throw new Error("Bulk deletes not yet implemented");
};

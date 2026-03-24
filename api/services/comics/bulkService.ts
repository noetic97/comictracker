/**
 * Bulk comic operations via Prisma (SQLite).
 *
 * "Copy" = one physical copy of a comic. Same (publisher, series, volume, issue, type)
 * with different grade, pricePaid, dateAdded, or storageLocation → separate copies.
 * Identical on all of those → same copy (dedupe / update).
 */

import { PrismaClient } from "@prisma/client";
import { validateComicBatch } from "./validationService";
import { BulkImportOptions, BulkImportResult } from "../../types/services";

/** Build a key that identifies one owned copy (for dedupe and match-against-DB). */
function copyKey(comic: {
  publisher: string;
  series: string;
  volume?: string | null;
  issue: string;
  type?: string | null;
  grade?: string | null;
  pricePaid?: number | null;
  dateAdded?: Date | string | null;
  storageLocation?: string | null;
}): string {
  const grade = (comic.grade ?? "").toString().trim();
  const pricePaid =
    comic.pricePaid != null && comic.pricePaid !== ""
      ? String(comic.pricePaid)
      : "n";
  const dateAdded =
    comic.dateAdded != null && comic.dateAdded !== ""
      ? new Date(comic.dateAdded as any).toISOString()
      : "";
  const storageLocation = (comic.storageLocation ?? "").toString().trim();
  return [
    comic.publisher,
    comic.series,
    comic.volume ?? "",
    comic.issue,
    comic.type ?? "",
    grade,
    pricePaid,
    dateAdded,
    storageLocation,
  ].join("|");
}

/**
 * Process bulk comic import with validation, deduplication, and proper created/updated tracking
 */
export const processBulkImport = async (
  prisma: PrismaClient,
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

  const validation = validateComicBatch(comicsToCreate);

  if (
    validation.validationErrors.length &&
    validation.validComics.length === 0
  ) {
    throw new Error(
      `Validation failed: ${validation.validationErrors.slice(0, 5).join(", ")}`
    );
  }

  const processedComics = processComicsForDatabase(validation.validComics, userId);

  const { deduplicatedComics, duplicatesSkipped } = skipDuplicates
    ? deduplicateComics(processedComics)
    : { deduplicatedComics: processedComics, duplicatesSkipped: 0 };

  if (reportDetails) {
    console.log(
      `✅ Processed comics: ${deduplicatedComics.length} unique, ${duplicatesSkipped} file duplicates skipped`
    );
    if (deduplicatedComics[0]) logSampleComic(deduplicatedComics[0]);
  }

  const { newComics, existingWithIds } = await categorizeComics(
    prisma,
    userId,
    deduplicatedComics
  );

  if (reportDetails) {
    console.log(
      `📊 Import breakdown: ${newComics.length} new, ${existingWithIds.length} updates (matched by copy key)`
    );
  }

  const { created, updated } = await performBulkCreateAndUpdate(
    prisma,
    userId,
    newComics,
    existingWithIds
  );
  const insertedCount = created + updated;

  const totalTime = Date.now() - startTime;

  const result: BulkImportResult = {
    processed: insertedCount,
    created,
    updated,
    errors: validation.validationErrors.length,
    message: buildImportMessage(created, updated, duplicatesSkipped),
    processingTime: totalTime,
    rate: Math.round(insertedCount / (totalTime / 1000)),
    validationErrors: validation.validationErrors.slice(0, 10),
    duplicatesSkipped,
  };

  console.log(
    `🎉 Import complete: ${created} created, ${updated} updated, ${duplicatesSkipped} file duplicates skipped`
  );

  return result;
};

/**
 * Process and clean comics data for database insertion (Prisma camelCase).
 * Only known schema fields are set (no id, originalIndex, or extras that could trigger upsert/ON CONFLICT).
 */
function processComicsForDatabase(validComics: any[], userId: string): any[] {
  return validComics.map((comic: any) => {
    const base: Record<string, unknown> = {
      publisher: comic.publisher,
      series: comic.series,
      volume: comic.volume || "",
      years: comic.years || "",
      type: comic.type || "",
      issue: comic.issue,
      issueNumber: comic.issueNumber ?? 1,
      currentValue: comic.currentValue ?? 0,
      pricePaid: comic.pricePaid ?? null,
      grade: comic.grade ?? null,
      gradeDetails: comic.gradeDetails ?? null,
      storageLocation: comic.storageLocation ?? null,
      notes: comic.notes ?? null,
      cert: comic.cert ?? null,
      signed: Boolean(comic.signed),
      variantDetails: comic.variantDetails ?? null,
      dateAdded: comic.dateAdded ?? null,
      issueDate: comic.issueDate ?? null,
      datePurchased: comic.datePurchased ?? null,
      storyTitle: comic.storyTitle ?? null,
      description: comic.description ?? null,
      writer: comic.writer ?? null,
      artist: comic.artist ?? null,
      coverArtist: comic.coverArtist ?? null,
      letterer: comic.letterer ?? null,
      firstAppearance: comic.firstAppearance ?? null,
      coverImageUrl: comic.coverImageUrl ?? null,
      certificationCompany: comic.certificationCompany ?? null,
      collected: Boolean(comic.collected),
      isGrail: Boolean(comic.isGrail),
      userId,
    };
    return base as any;
  });
}

/** Within-file dedupe: only collapse rows that are the same copy (same grade, pricePaid, dateAdded, storageLocation). */
function deduplicateComics(comics: any[]) {
  const deduplicatedComics: any[] = [];
  const seen = new Set<string>();
  let duplicatesSkipped = 0;

  for (const comic of comics) {
    const key = copyKey(comic);
    if (!seen.has(key)) {
      seen.add(key);
      deduplicatedComics.push(comic);
    } else {
      duplicatesSkipped++;
      console.log(
        `🔄 Skipping duplicate copy: ${comic.publisher} - ${comic.series} #${comic.issue} (same grade/price/date/pile)`
      );
    }
  }

  return { deduplicatedComics, duplicatesSkipped };
}

/** Match against DB by copy key; return new vs existing (with id for updates). */
async function categorizeComics(
  prisma: PrismaClient,
  userId: string,
  comics: any[]
) {
  const existing = await prisma.comic.findMany({
    where: { userId },
    select: {
      id: true,
      publisher: true,
      series: true,
      volume: true,
      issue: true,
      type: true,
      grade: true,
      pricePaid: true,
      dateAdded: true,
      storageLocation: true,
    },
  });

  const keyToId = new Map<string, string>();
  for (const c of existing) {
    const key = copyKey({
      publisher: c.publisher,
      series: c.series,
      volume: c.volume,
      issue: c.issue,
      type: c.type,
      grade: c.grade,
      pricePaid: c.pricePaid,
      dateAdded: c.dateAdded,
      storageLocation: c.storageLocation,
    });
    keyToId.set(key, c.id);
  }

  const newComics: any[] = [];
  const existingWithIds: Array<{ comic: any; existingId: string }> = [];

  for (const comic of comics) {
    const key = copyKey(comic);
    const existingId = keyToId.get(key);
    if (existingId != null) {
      existingWithIds.push({ comic, existingId });
    } else {
      newComics.push(comic);
    }
  }

  return { newComics, existingWithIds };
}

/**
 * Create new copies and update existing ones by id (no unique constraint on comic identity).
 * Uses individual create() calls because createMany() is not supported for SQLite in Prisma.
 */
async function performBulkCreateAndUpdate(
  prisma: PrismaClient,
  userId: string,
  newComics: any[],
  existingWithIds: Array<{ comic: any; existingId: string }>
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  if (newComics.length > 0) {
    console.log(`📥 [BULK] Inserting ${newComics.length} new comics via create() (SQLite)`);
    try {
      for (const comic of newComics) {
        await prisma.comic.create({ data: comic });
        created++;
      }
      console.log(`📥 [BULK] create completed: ${created} created`);
    } catch (createErr: any) {
      console.error("[BULK] create failed:", createErr?.message ?? createErr);
      console.error("[BULK] Error name:", createErr?.name);
      console.error("[BULK] Full error (for debugging):", createErr);
      throw createErr;
    }
  }

  for (const { comic, existingId } of existingWithIds) {
    const { userId: _uid, ...data } = comic;
    await prisma.comic.update({
      where: { id: existingId },
      data,
    });
    updated++;
  }

  return { created, updated };
}

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

function logSampleComic(comic: any) {
  if (comic) {
    console.log(`🔍 Sample comic field names:`, Object.keys(comic));
    console.log(`📋 Sample comic data:`, JSON.stringify(comic, null, 2));
  }
}

export const processBulkUpdate = async (
  _prisma: PrismaClient,
  _userId: string,
  _updates: any[]
): Promise<BulkImportResult> => {
  throw new Error("Bulk updates not yet implemented");
};

export const processBulkDelete = async (
  _prisma: PrismaClient,
  _userId: string,
  _criteria: any
): Promise<BulkImportResult> => {
  throw new Error("Bulk deletes not yet implemented");
};

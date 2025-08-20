import { Comic } from "../types";
import { apiService } from "./apiService";
import { createComicKey } from "./comicValidator";

export interface AnalysisResult {
  totalInFile: number;
  totalInDatabase: number;
  missing: MissingComic[];
  duplicatesInFile: DuplicateComic[];
  invalidComics: InvalidComic[];
  typeMismatches: TypeMismatch[];
}

export interface MissingComic {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  type: string;
  currentValue: number;
  reason: string;
  fileIndex: number;
}

export interface DuplicateComic {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  type: string;
  count: number;
  fileIndices: number[];
}

export interface InvalidComic {
  index: number;
  data: any;
  reason: string;
  errors: string[];
}

export interface TypeMismatch {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  fileType: string;
  databaseTypes: string[];
}

/**
 * Load database comics for comparison
 */
const loadDatabaseComics = async (): Promise<{
  dbComics: Comic[];
  dbLookup: Map<string, Comic>;
}> => {
  const { comics } = await apiService.comics.getAll();
  const dbComics = comics;

  // Create lookup map with type included
  const dbLookup = new Map<string, Comic>();
  comics.forEach((comic) => {
    const key = createComicKey(comic, true);
    dbLookup.set(key, comic);
  });

  return { dbComics, dbLookup };
};

/**
 * Validate individual comic data
 */
const validateComicData = (comic: Comic, _index: number) => {
  const errors: string[] = [];

  if (!comic.publisher || comic.publisher.trim() === "") {
    errors.push("Missing publisher");
  }
  if (!comic.series || comic.series.trim() === "") {
    errors.push("Missing series");
  }
  if (!comic.issue || comic.issue.trim() === "") {
    errors.push("Missing issue");
  }

  return {
    isValid: errors.length === 0,
    reason:
      errors.length > 0 ? `Missing required fields: ${errors.join(", ")}` : "",
    errors,
  };
};

/**
 * Find type mismatches for a comic
 */
const findTypeMismatch = (
  comic: Comic,
  keyWithoutType: string,
  dbLookup: Map<string, Comic>
): TypeMismatch | null => {
  const matchingComics = Array.from(dbLookup.entries())
    .filter(([dbKey]) => dbKey.startsWith(keyWithoutType + "|"))
    .map(([_, dbComic]) => dbComic);

  if (matchingComics.length > 0) {
    const databaseTypes = [
      ...new Set(matchingComics.map((c) => c.type || "[no type]")),
    ];

    return {
      publisher: comic.publisher,
      series: comic.series,
      volume: comic.volume || "",
      issue: comic.issue,
      fileType: comic.type || "[no type]",
      databaseTypes,
    };
  }

  return null;
};

/**
 * Sanitize comic data for safe logging/reporting
 */
const sanitizeComicData = (comic: Comic) => {
  return {
    publisher: comic.publisher || "[EMPTY]",
    series: comic.series || "[EMPTY]",
    volume: comic.volume || "[EMPTY]",
    issue: comic.issue || "[EMPTY]",
    type: comic.type || "[EMPTY]",
    "Current Value": comic["currentValue"] || "[EMPTY]",
  };
};

/**
 * Analyze comics from file against database
 */
export const analyzeComics = async (
  fileComics: any[]
): Promise<AnalysisResult> => {
  const { dbComics, dbLookup } = await loadDatabaseComics();

  const missing: MissingComic[] = [];
  const duplicatesInFile: DuplicateComic[] = [];
  const invalidComics: InvalidComic[] = [];
  const typeMismatches: TypeMismatch[] = [];

  // Track duplicates within the file
  const fileComicCounts = new Map<
    string,
    { count: number; indices: number[] }
  >();

  // First pass: identify duplicates in file and validate
  fileComics.forEach((comic, index) => {
    const key = createComicKey(comic, true);

    if (!fileComicCounts.has(key)) {
      fileComicCounts.set(key, { count: 0, indices: [] });
    }

    const entry = fileComicCounts.get(key)!;
    entry.count++;
    entry.indices.push(index);
  });

  // Identify duplicates
  fileComicCounts.forEach((entry, key) => {
    if (entry.count > 1) {
      const [publisher, series, volume, issue, type] = key.split("|");
      duplicatesInFile.push({
        publisher,
        series,
        volume,
        issue,
        type,
        count: entry.count,
        fileIndices: entry.indices,
      });
    }
  });

  // Second pass: find missing and invalid comics
  fileComics.forEach((comic, index) => {
    // Validate comic
    const validation = validateComicData(comic, index);
    if (!validation.isValid) {
      invalidComics.push({
        index: index + 1,
        data: sanitizeComicData(comic),
        reason: validation.reason,
        errors: validation.errors,
      });
      return;
    }

    // Check if comic exists in database
    const key = createComicKey(comic, true);

    if (!dbLookup.has(key)) {
      // Check for type mismatches
      const keyWithoutType = createComicKey(comic, false);
      const typeMismatch = findTypeMismatch(comic, keyWithoutType, dbLookup);

      if (typeMismatch) {
        typeMismatches.push(typeMismatch);
      }

      missing.push({
        publisher: comic.publisher,
        series: comic.series,
        volume: comic.volume || "",
        issue: comic.issue,
        type: comic.type || "",
        currentValue: parseFloat(comic["Current Value"]) || 0,
        reason: typeMismatch
          ? `Type mismatch - exists as: ${typeMismatch.databaseTypes.join(
              ", "
            )}`
          : "Not found in database",
        fileIndex: index,
      });
    }
  });

  return {
    totalInFile: fileComics.length,
    totalInDatabase: dbComics.length,
    missing,
    duplicatesInFile,
    invalidComics,
    typeMismatches,
  };
};

/**
 * Get summary statistics
 */
export const getAnalysisSummary = (result: AnalysisResult) => {
  return {
    totalInFile: result.totalInFile,
    totalInDatabase: result.totalInDatabase,
    missingCount: result.missing.length,
    duplicateCount: result.duplicatesInFile.length,
    invalidCount: result.invalidComics.length,
    typeMismatchCount: result.typeMismatches.length,
    successfullyMatchedCount:
      result.totalInFile - result.missing.length - result.invalidComics.length,
  };
};

/**
 * Convenience function for one-off analysis
 */
export const analyzeComicsFile = async (
  fileComics: any[]
): Promise<AnalysisResult> => {
  return analyzeComics(fileComics);
};

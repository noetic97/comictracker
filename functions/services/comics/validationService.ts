/**
 * Validation Service - Centralized comic validation logic
 * Moved from functions/comics/validation.ts for better organization
 * Used by: bulkService, comicsService, and external validation needs
 */

import {
  ComicValidationOptions,
  ValidationResult,
  BulkValidationResult,
  ExtendedComicInput,
  ComicValidationResult,
} from "../../types/services";

const isNonEmptyString = (v: any): boolean =>
  typeof v === "string" && v.trim().length > 0;

const parseNumericField = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  const parsed = parseFloat(String(value).replace(/[\$,\s]/g, ""));
  return isNaN(parsed) ? null : parsed;
};

const parseBooleanField = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (!value) return false;

  const str = String(value).trim().toLowerCase();
  return ["true", "yes", "y", "1", "on", "signed", "checked"].includes(str);
};

const parseDateField = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Enhanced parsing functions for CSV data
const parseText = (input: any): string | null => {
  if (!input || input === "null" || input === "N/A") return null;
  const trimmed = String(input).trim();
  return trimmed === "" ? null : trimmed;
};

const parseNumeric = (
  input: any,
  defaultValue: number | null = null
): number | null => {
  if (input === null || input === undefined || input === "") {
    return defaultValue;
  }

  if (typeof input === "number") {
    return input;
  }

  // Simple clean and parse - remove $ and commas only
  const cleaned = String(input).replace(/[\$,]/g, "");
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? defaultValue : parsed;
};

const parseIssueNumber = (issue: any): number => {
  if (typeof issue === "number") return issue;
  if (!issue) return 1;

  const str = String(issue).trim();
  const num = parseFloat(str);
  return isNaN(num) ? 1 : num;
};

const validateGrade = (
  grade: any
): { value: string | null; warning?: string } => {
  if (!grade) return { value: null };

  const gradeStr = String(grade).trim();
  if (gradeStr === "") return { value: null };

  // Accept any non-empty string as a valid grade
  return { value: gradeStr };
};

/**
 * Main validation function for comics
 * Supports both direct validation and CSV data transformation
 */
export const validateComic = (
  data: any,
  index?: number,
  options: ComicValidationOptions = {}
): ValidationResult & { transformedComic?: any } => {
  const {
    requireNumericIssue = false,
    allowEmptyVolume = true,
    allowEmptyType = true,
    transformData = false,
    isCSVData = false,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  const prefix = index !== undefined ? `Row ${index + 1}: ` : "";

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: [`${prefix}Body must be a JSON object`],
    };
  }

  // Handle CSV data transformation if needed
  if (transformData || isCSVData) {
    const transformResult = validateComicFields(data);

    // Add row context to messages
    const contextualWarnings = transformResult.warnings.map(
      (warning) => `${prefix}${warning}`
    );
    const contextualErrors = transformResult.errors.map(
      (error) => `${prefix}${error}`
    );

    return {
      isValid: transformResult.isValid,
      errors: contextualErrors,
      warnings: contextualWarnings,
      transformedComic: transformResult.isValid
        ? transformResult.comic
        : undefined,
    };
  }

  // Standard validation for already-parsed data
  // Required fields validation
  if (!isNonEmptyString(data.publisher)) {
    errors.push(`${prefix}Publisher is required`);
  }
  if (!isNonEmptyString(data.series)) {
    errors.push(`${prefix}Series is required`);
  }
  if (!isNonEmptyString(data.issue)) {
    errors.push(`${prefix}Issue is required`);
  }

  // Optional field validation
  if (!allowEmptyVolume && (!data.volume || data.volume.trim() === "")) {
    warnings.push(`${prefix}Missing volume`);
  }

  if (!allowEmptyType && (!data.type || data.type.trim() === "")) {
    warnings.push(`${prefix}Missing type`);
  }

  // Issue number validation
  if (requireNumericIssue && data.issue) {
    const issueNum = parseInt(data.issue);
    if (isNaN(issueNum)) {
      warnings.push(`${prefix}Non-numeric issue number "${data.issue}"`);
    }
  }

  // Current value validation
  if (data.currentValue !== undefined) {
    const value = parseFloat(data.currentValue);
    if (isNaN(value)) {
      warnings.push(`${prefix}Invalid current value "${data.currentValue}"`);
    } else if (value < 0) {
      warnings.push(`${prefix}Negative current value "${value}"`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Transform and validate the data for server-side processing
  const transformedData = transformComicInput(data);

  return {
    isValid: true,
    errors: [],
    warnings,
    data: transformedData,
  };
};

/**
 * Unified batch validation that handles both server and client needs
 * Supports CSV data processing and detailed error reporting
 */
export const validateComicBatch = (
  comics: any[],
  options: ComicValidationOptions = {}
): BulkValidationResult => {
  if (!Array.isArray(comics)) {
    return {
      validComics: [],
      validationErrors: ["Expected 'comics' array for bulk operation"],
      totalProcessed: 0,
    };
  }

  const validComics: any[] = [];
  const invalidComics: any[] = [];
  const validationErrors: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < comics.length; i++) {
    const result = validateComic(comics[i], i, options);

    if (result.isValid) {
      // Use transformed data if available, otherwise use data field
      const comicToAdd = result.transformedComic || result.data || comics[i];
      validComics.push({
        ...comicToAdd,
        originalIndex: i, // Track original position for error reporting
      });
    } else {
      invalidComics.push({
        originalIndex: i,
        data: comics[i],
        errors: result.errors,
        warnings: result.warnings || [],
      });
    }

    // Collect all warnings and errors
    if (result.warnings) {
      allWarnings.push(...result.warnings);
    }
    validationErrors.push(...result.errors);
  }

  return {
    validComics,
    invalidComics,
    validationErrors,
    warnings: allWarnings,
    totalProcessed: comics.length,
    summary: {
      total: comics.length,
      valid: validComics.length,
      invalid: invalidComics.length,
      warningCount: allWarnings.length,
      errorCount: validationErrors.length,
    },
  };
};

/**
 * Transform frontend comic input to database format
 */
export const transformComicInput = (comic: ExtendedComicInput): any => {
  return {
    // Core fields
    publisher: comic.publisher.trim(),
    series: comic.series.trim(),
    volume: (comic.volume || "").trim(),
    years: (comic.years || "").trim(),
    type: (comic.type || "").trim(),
    issue: comic.issue.trim(),
    issueNumber: parseNumericField(comic.issueNumber || comic.issue) || 1,

    // Financial fields
    currentValue: parseNumericField(comic.currentValue) || 0,
    pricePaid: parseNumericField(comic.pricePaid),

    // Physical/ownership fields
    grade: comic.grade?.trim() || null,
    gradeDetails: comic.gradeDetails?.trim() || null,
    storageLocation: comic.storageLocation?.trim() || null,
    notes: comic.notes?.trim() || null,
    cert: comic.cert?.trim() || null,
    signed: parseBooleanField(comic.signed),
    variantDetails: comic.variantDetails?.trim() || null,

    // Date fields
    dateAdded: parseDateField(comic.dateAdded),
    issueDate: comic.issueDate?.trim() || null,
    datePurchased: parseDateField(comic.datePurchased),

    // Creative team fields
    storyTitle: comic.storyTitle?.trim() || null,
    description: comic.description?.trim() || null,
    writer: comic.writer?.trim() || null,
    artist: comic.artist?.trim() || null,
    coverArtist: comic.coverArtist?.trim() || null,
    letterer: comic.letterer?.trim() || null,
    firstAppearance: comic.firstAppearance?.trim() || null,
    coverImageUrl: comic.coverImageUrl?.trim() || null,
    certificationCompany: comic.certificationCompany?.trim() || null,

    // User state - auto-determine collected based on pricePaid
    collected:
      comic.collected ??
      (parseNumericField(comic.pricePaid) !== null &&
        parseNumericField(comic.pricePaid)! >= 0),
    isGrail: Boolean(comic.isGrail),
  };
};

/**
 * CSV-specific validation function for raw CSV data
 * Handles field mapping and transformation from CSV headers to database fields
 */
export const validateComicFields = (rawData: any): ComicValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: any = {};

  // Required fields - fail fast if missing
  if (!rawData.Publisher?.trim()) errors.push("Publisher is required");
  else data.publisher = rawData.Publisher.trim();

  if (!rawData.Series?.trim()) errors.push("Series is required");
  else data.series = rawData.Series.trim();

  if (!rawData.Issue?.trim()) errors.push("Issue is required");
  else data.issue = rawData.Issue.trim();

  // If any required field is missing, return early
  if (errors.length > 0) {
    return { isValid: false, comic: {}, errors, warnings, skippedFields: [] };
  }

  // Optional text fields - using EXACT database column names (camelCase)
  data.volume = parseText(rawData.Volume) || "";
  data.years = parseText(rawData.Years) || "";
  data.type = parseText(rawData.Type) || "";
  data.notes = parseText(rawData.Notes);
  data.cert = parseText(rawData.CERT);
  data.storageLocation = parseText(rawData.storageLocation || rawData.Pile);

  // Numeric fields - using EXACT database column names (camelCase)
  data.currentValue = parseNumeric(rawData["Current Value"], 0);
  data.pricePaid = parseNumeric(rawData["Price Paid"]);
  data.issueNumber = parseIssueNumber(rawData.Issue);

  // Grade - accept any string
  const gradeResult = validateGrade(rawData.Grade);
  data.grade = gradeResult.value;
  if (gradeResult.warning) {
    warnings.push(gradeResult.warning);
  }

  // Boolean fields
  data.signed = parseBooleanField(rawData.Signed);
  data.variantDetails = parseText(rawData["Variant Details"]);

  // Date fields - using EXACT database column names (camelCase)
  data.dateAdded = parseDateField(rawData["Date Added"]);
  data.datePurchased = parseDateField(rawData["Date Purchased"]);

  // Auto-determine collected status
  data.collected = data.pricePaid !== null && data.pricePaid >= 0;
  data.isGrail = false;

  // Creative team fields (if present) - using EXACT database column names (camelCase)
  data.storyTitle = parseText(rawData["Story Title"]);
  data.writer = parseText(rawData.Writer);
  data.artist = parseText(rawData.Artist);
  data.coverArtist = parseText(rawData["Cover Artist"]);
  data.description = parseText(rawData.Description);

  // Additional fields - using EXACT database column names (camelCase)
  data.gradeDetails = parseText(rawData["Grade Details"]);
  data.issueDate = parseText(rawData["Issue Date"]);
  data.letterer = parseText(rawData.Letterer);
  data.firstAppearance = parseText(rawData["First Appearance"]);
  data.coverImageUrl = parseText(rawData["Cover Image URL"]);
  data.certificationCompany = parseText(rawData["Certification Company"]);

  return {
    isValid: true,
    comic: data,
    errors,
    warnings,
    skippedFields: [],
  };
};

/**
 * Normalizes comic data for consistent processing
 * Creates a standardized format from various input sources
 */
export const normalizeComic = (comic: any) => {
  const normalized: any = {
    publisher: (comic.publisher || "").trim(),
    series: (comic.series || "").trim(),
    volume: (comic.volume || "").trim(),
    years: (comic.years || "").trim(),
    type: (comic.type || "").trim(),
    issue: (comic.issue || "").trim(),
    issueNumber: parseIssueNumber(comic.issueNumber || comic.issue),
    currentValue: parseFloat(comic["Current Value"] || comic.currentValue) || 0,
    collected: Boolean(comic.collected),
    isGrail: Boolean(comic.isGrail),
  };

  // Generate unique ID if not provided
  if (!comic.id) {
    normalized.id = generateComicId(normalized);
  } else {
    normalized.id = comic.id;
  }

  return normalized;
};

/**
 * Creates a unique key for comic identification
 */
export const createComicKey = (
  comic: any,
  includeType: boolean = true
): string => {
  const parts = [
    comic.publisher || "",
    comic.series || "",
    comic.volume || "",
    comic.issue || "",
  ];

  if (includeType) {
    parts.push(comic.type || "");
  }

  return parts.join("|").toLowerCase();
};

/**
 * Generates a unique ID for comics
 */
export const generateComicId = (comic: any): string => {
  return `${comic.publisher}-${comic.series}-${comic.volume}-${
    comic.issue || ""
  }`.toLowerCase();
};

/**
 * Generates a unique ID for favorite series
 */
export const generateFavoriteSeriesId = (
  publisher: string,
  series: string,
  volume: string
): string => {
  return `${publisher}-${series}-${volume}`;
};

/**
 * Transform database comic to frontend format
 * IMPORTANT: Database uses camelCase, frontend expects camelCase too
 */
export const transformComicOutput = (comic: any): any => {
  // Most fields are already in the correct format since DB uses camelCase
  // Only need to transform the user_id field
  return {
    ...comic,
    userId: comic.user_id, // Transform snake_case user_id to camelCase userId
    // All other fields are already camelCase in the database
  };
};

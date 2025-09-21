/**
 * Shared validation utilities for client-side use
 * This file provides client-safe access to validation functions
 * without direct dependencies on server-side code
 */

import { Comic } from "../../types/comic";

// Re-export types that can be safely shared
export interface ComicValidationOptions {
  requireNumericIssue?: boolean;
  allowEmptyVolume?: boolean;
  allowEmptyType?: boolean;
  transformData?: boolean;
  isCSVData?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  data?: any;
  transformedComic?: any;
}

export interface BulkValidationResult {
  validComics: any[];
  invalidComics?: any[];
  validationErrors: string[];
  warnings?: string[];
  totalProcessed: number;
  summary?: {
    total: number;
    valid: number;
    invalid: number;
    warningCount: number;
    errorCount: number;
  };
}

export interface ComicValidationResult {
  isValid: boolean;
  comic?: any;
  errors: string[];
  warnings: string[];
  skippedFields: string[];
}

// Utility functions that can be safely shared
export const parseIssueNumber = (issue: string | number): number => {
  if (typeof issue === "number") {
    return issue;
  }

  if (!issue || typeof issue !== "string") {
    return 0;
  }

  // Try to extract number from string
  const match = issue.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  // Special cases for non-numeric issues
  const specialIssues: Record<string, number> = {
    fcbd: -1,
    ashcan: -2,
    preview: -3,
    annual: 1000, // Sort annuals after regular issues
    special: 1001,
    "one-shot": 1002,
  };

  const lowerIssue = issue.toLowerCase();
  for (const [key, value] of Object.entries(specialIssues)) {
    if (lowerIssue.includes(key)) {
      return value;
    }
  }

  return 0; // Default for unrecognized formats
};

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

export const generateComicId = (comic: any): string => {
  return `${comic.publisher}-${comic.series}-${comic.volume}-${
    comic.issue || ""
  }`.toLowerCase();
};

export const generateFavoriteSeriesId = (
  publisher: string,
  series: string,
  volume: string
): string => {
  return `${publisher}-${series}-${volume}`;
};

// Client-side validation function that mimics the server-side logic
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
  const isNonEmptyString = (v: any): boolean =>
    typeof v === "string" && v.trim().length > 0;

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

  return {
    isValid: true,
    errors: [],
    warnings,
    data: data, // Return original data for client-side use
  };
};

// Client-side batch validation
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

// CSV-specific validation function for raw CSV data
export const validateComicFields = (rawData: any): ComicValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: any = {};

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

  // Grade validation with common formats
  const COMMON_GRADES = new Set([
    "10.0",
    "9.9",
    "9.8",
    "9.6",
    "9.4",
    "9.2",
    "9.0",
    "8.5",
    "8.0",
    "7.5",
    "7.0",
    "6.5",
    "6.0",
    "5.5",
    "5.0",
    "4.5",
    "4.0",
    "3.5",
    "3.0",
    "2.5",
    "2.0",
    "1.8",
    "1.5",
    "1.0",
    "0.5",
    "NM",
    "VF",
    "FN",
    "VG",
    "GD",
    "FR",
    "PR",
    "NM+",
    "NM-",
    "VF+",
    "VF-",
    "FN+",
    "FN-",
    "VG+",
    "VG-",
    "GD+",
    "GD-",
    "NM/M",
    "VF/NM",
  ]);

  const validateGrade = (
    input: any
  ): { value: string | null; warning?: string } => {
    if (!input || input === "" || input === "null" || input === "N/A") {
      return { value: null };
    }

    const gradeStr = String(input).trim();
    if (gradeStr.length === 0) {
      return { value: null };
    }

    // Check if it's a common format, warn if not
    const upperGrade = gradeStr.toUpperCase();
    if (!COMMON_GRADES.has(upperGrade)) {
      return {
        value: gradeStr,
        warning: `Grade "${gradeStr}" is not a common format. Consider: 9.8, NM, VF, etc.`,
      };
    }

    return { value: gradeStr };
  };

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
  data.variantDetails = parseText(rawData["Variant Details"]);
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

// Normalizes comic data for consistent processing
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

export const isValidComic = (comic: unknown): comic is Comic => {
  if (typeof comic !== "object" || comic === null) {
    return false;
  }

  const c = comic as Partial<Comic>;

  return (
    typeof c.id === "string" &&
    typeof c.publisher === "string" &&
    typeof c.series === "string" &&
    typeof c.issue === "string" &&
    typeof c.issueNumber === "number" &&
    typeof c.currentValue === "number" &&
    typeof c.collected === "boolean" &&
    c.volume !== undefined &&
    c.years !== undefined &&
    c.type !== undefined &&
    (c.isGrail === undefined || typeof c.isGrail === "boolean") // isGrail is optional for backward compatibility
  );
};

export interface ValidationResult {
  isValid: boolean;
  data: any;
  warnings: string[];
  errors: string[];
}

// Common grade values we accept (for suggestion purposes)
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

/**
 * Fast grade validation - accepts any string, suggests common formats
 */
const validateGrade = (
  input: any
): { value: string | null; warning?: string } => {
  if (!input || input === "" || input === "null" || input === "N/A") {
    return { value: null };
  }

  const gradeStr = String(input).trim();

  // Accept any non-empty string as grade
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

/**
 * Fast numeric parsing - minimal validation
 */
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

/**
 * Fast boolean parsing - simple true/false detection
 */
const parseBoolean = (input: any): boolean => {
  if (typeof input === "boolean") return input;
  if (!input) return false;

  const str = String(input).toLowerCase().trim();
  return ["true", "yes", "1", "y", "signed", "on"].includes(str);
};

/**
 * Fast text parsing - just trim and null empty strings
 */
const parseText = (input: any): string | null => {
  if (!input || input === "null" || input === "N/A") return null;
  const trimmed = String(input).trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * Simple date parsing - ISO format only
 */
const parseDate = (input: any): Date | null => {
  if (!input) return null;

  try {
    const date = new Date(String(input));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Main validation function - fast and simple
 * This replaces the complex normalizeComicFields function
 */
export const validateComicFields = (rawData: any): ValidationResult => {
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
    return { isValid: false, data: {}, errors, warnings };
  }

  // Optional text fields - simple assignment
  data.volume = parseText(rawData.Volume) || "";
  data.years = parseText(rawData.Years) || "";
  data.type = parseText(rawData.Type) || "";
  data.notes = parseText(rawData.Notes);
  data.cert = parseText(rawData.CERT);
  data.storageLocation = parseText(rawData.storageLocation || rawData.Pile);

  // Numeric fields
  data.currentValue = parseNumeric(rawData["Current Value"], 0);
  data.pricePaid = parseNumeric(rawData["Price Paid"]);
  data.issueNumber = parseNumeric(rawData.Issue, 1);

  // Grade - accept any string
  const gradeResult = validateGrade(rawData.Grade);
  data.grade = gradeResult.value;
  if (gradeResult.warning) {
    warnings.push(gradeResult.warning);
  }

  // Boolean fields
  data.signed = parseBoolean(rawData.Signed);

  // Dates - simple parsing only
  data.dateAdded = parseDate(rawData["Date Added"]);
  data.datePurchased = parseDate(rawData["Date Purchased"]);

  // Auto-determine collected status
  data.collected = data.pricePaid !== null && data.pricePaid >= 0;
  data.isGrail = false;

  // Creative team fields (if present)
  data.storyTitle = parseText(rawData["Story Title"]);
  data.writer = parseText(rawData.Writer);
  data.artist = parseText(rawData.Artist);
  data.coverArtist = parseText(rawData["Cover Artist"]);
  data.description = parseText(rawData.Description);

  return {
    isValid: true,
    data,
    errors,
    warnings,
  };
};

/**
 * Batch validation for arrays of comics - optimized for performance
 */
export const validateComicBatch = (
  rawComics: any[]
): {
  validComics: any[];
  invalidComics: any[];
  warnings: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warningCount: number;
  };
} => {
  const validComics: any[] = [];
  const invalidComics: any[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < rawComics.length; i++) {
    const result = validateComicFields(rawComics[i]);

    if (result.isValid) {
      validComics.push({
        ...result.data,
        originalIndex: i,
      });

      // Add context to warnings
      result.warnings.forEach((warning) => {
        allWarnings.push(`Row ${i + 1}: ${warning}`);
      });
    } else {
      invalidComics.push({
        originalIndex: i,
        data: rawComics[i],
        errors: result.errors.map((error) => `Row ${i + 1}: ${error}`),
      });
    }
  }

  return {
    validComics,
    invalidComics,
    warnings: allWarnings,
    summary: {
      total: rawComics.length,
      valid: validComics.length,
      invalid: invalidComics.length,
      warningCount: allWarnings.length,
    },
  };
};

/**
 * Get list of common grades for UI suggestions
 */
export const getCommonGrades = (): string[] => {
  return Array.from(COMMON_GRADES).sort();
};

/**
 * Determine if a comic should be marked as collected
 */
export const determineCollectedStatus = (pricePaid: number | null): boolean => {
  return pricePaid !== null && pricePaid >= 0;
};

/**
 * Simple format validation for CSV headers
 */
export const validateCSVHeaders = (
  headers: string[]
): {
  isValid: boolean;
  missingRequired: string[];
  suggestions: string[];
} => {
  const required = ["Publisher", "Series", "Issue"];
  const missing = required.filter(
    (field) => !headers.some((header) => header.trim() === field)
  );

  return {
    isValid: missing.length === 0,
    missingRequired: missing,
    suggestions: missing.map(
      (field) => `Add "${field}" column to your CSV file`
    ),
  };
};

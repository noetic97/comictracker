// gradeNormalization.ts - Grade and data normalization utilities

import { ComicGrade } from "../types";

// Input types for flexibility
export type GradeInput = string | number | null | undefined;
export type DateInput = string | Date | null | undefined;
export type BooleanInput = string | boolean | number | null | undefined;

// Comprehensive grade normalization mapping
const GRADE_INPUT_MAP: Record<string, ComicGrade> = {
  // Numeric grades (as strings)
  "10.0": ComicGrade.GRADE_10_0,
  "10": ComicGrade.GRADE_10_0,
  "9.9": ComicGrade.GRADE_9_9,
  "9.8": ComicGrade.GRADE_9_8,
  "9.6": ComicGrade.GRADE_9_6,
  "9.4": ComicGrade.GRADE_9_4,
  "9.2": ComicGrade.GRADE_9_2,
  "9.0": ComicGrade.GRADE_9_0,
  "9": ComicGrade.GRADE_9_0,
  "8.5": ComicGrade.GRADE_8_5,
  "8.0": ComicGrade.GRADE_8_0,
  "8": ComicGrade.GRADE_8_0,
  "7.5": ComicGrade.GRADE_7_5,
  "7.0": ComicGrade.GRADE_7_0,
  "7": ComicGrade.GRADE_7_0,
  "6.5": ComicGrade.GRADE_6_5,
  "6.0": ComicGrade.GRADE_6_0,
  "6": ComicGrade.GRADE_6_0,
  "5.5": ComicGrade.GRADE_5_5,
  "5.0": ComicGrade.GRADE_5_0,
  "5": ComicGrade.GRADE_5_0,
  "4.5": ComicGrade.GRADE_4_5,
  "4.0": ComicGrade.GRADE_4_0,
  "4": ComicGrade.GRADE_4_0,
  "3.5": ComicGrade.GRADE_3_5,
  "3.0": ComicGrade.GRADE_3_0,
  "3": ComicGrade.GRADE_3_0,
  "2.5": ComicGrade.GRADE_2_5,
  "2.0": ComicGrade.GRADE_2_0,
  "2": ComicGrade.GRADE_2_0,
  "1.8": ComicGrade.GRADE_1_8,
  "1.5": ComicGrade.GRADE_1_5,
  "1.0": ComicGrade.GRADE_1_0,
  "1": ComicGrade.GRADE_1_0,
  "0.5": ComicGrade.GRADE_0_5,

  // String grades with common variations
  GMT: ComicGrade.GMT,
  GEMMINT: ComicGrade.GMT,
  "GEM MINT": ComicGrade.GMT,
  "GEM-MINT": ComicGrade.GMT,

  MT: ComicGrade.MT,
  MINT: ComicGrade.MT,
  M: ComicGrade.MT,

  "NM/M": ComicGrade.NM_M,
  "NM-M": ComicGrade.NM_M,
  "NEARMINT/MINT": ComicGrade.NM_M,
  "NEAR MINT/MINT": ComicGrade.NM_M,

  "NM+": ComicGrade.NM_PLUS,
  NMPLUS: ComicGrade.NM_PLUS,
  "NM PLUS": ComicGrade.NM_PLUS,
  "NEARMINT+": ComicGrade.NM_PLUS,
  "NEAR MINT+": ComicGrade.NM_PLUS,
  "NEAR MINT PLUS": ComicGrade.NM_PLUS,

  NM: ComicGrade.NM,
  NEARMINT: ComicGrade.NM,
  "NEAR MINT": ComicGrade.NM,
  "NEAR-MINT": ComicGrade.NM,

  "NM-": ComicGrade.NM_MINUS,
  NMMINUS: ComicGrade.NM_MINUS,
  "NM MINUS": ComicGrade.NM_MINUS,
  "NEARMINT-": ComicGrade.NM_MINUS,
  "NEAR MINT-": ComicGrade.NM_MINUS,
  "NEAR MINT MINUS": ComicGrade.NM_MINUS,

  "VF/NM": ComicGrade.VF_NM,
  "VF-NM": ComicGrade.VF_NM,
  "VERYFINE/NEARMINT": ComicGrade.VF_NM,
  "VERY FINE/NEAR MINT": ComicGrade.VF_NM,

  "VF+": ComicGrade.VF_PLUS,
  VFPLUS: ComicGrade.VF_PLUS,
  "VF PLUS": ComicGrade.VF_PLUS,
  "VERYFINE+": ComicGrade.VF_PLUS,
  "VERY FINE+": ComicGrade.VF_PLUS,

  VF: ComicGrade.VF,
  VERYFINE: ComicGrade.VF,
  "VERY FINE": ComicGrade.VF,
  "VERY-FINE": ComicGrade.VF,

  "VF-": ComicGrade.VF_MINUS,
  VFMINUS: ComicGrade.VF_MINUS,
  "VF MINUS": ComicGrade.VF_MINUS,
  "VERYFINE-": ComicGrade.VF_MINUS,
  "VERY FINE-": ComicGrade.VF_MINUS,

  "F/VF": ComicGrade.F_VF,
  "F-VF": ComicGrade.F_VF,
  "FINE/VERYFINE": ComicGrade.F_VF,
  "FINE/VERY FINE": ComicGrade.F_VF,

  "FN+": ComicGrade.FN_PLUS,
  FNPLUS: ComicGrade.FN_PLUS,
  "FN PLUS": ComicGrade.FN_PLUS,
  "FINE+": ComicGrade.FN_PLUS,
  "F+": ComicGrade.FN_PLUS,

  FN: ComicGrade.FN,
  FINE: ComicGrade.FN,
  F: ComicGrade.FN,

  "FN-": ComicGrade.FN_MINUS,
  FNMINUS: ComicGrade.FN_MINUS,
  "FN MINUS": ComicGrade.FN_MINUS,
  "FINE-": ComicGrade.FN_MINUS,
  "F-": ComicGrade.FN_MINUS,

  "VG/F": ComicGrade.VG_F,
  "VG-F": ComicGrade.VG_F,
  "VERYGOOD/FINE": ComicGrade.VG_F,
  "VERY GOOD/FINE": ComicGrade.VG_F,

  "VG+": ComicGrade.VG_PLUS,
  VGPLUS: ComicGrade.VG_PLUS,
  "VG PLUS": ComicGrade.VG_PLUS,
  "VERYGOOD+": ComicGrade.VG_PLUS,
  "VERY GOOD+": ComicGrade.VG_PLUS,

  VG: ComicGrade.VG,
  VERYGOOD: ComicGrade.VG,
  "VERY GOOD": ComicGrade.VG,
  "VERY-GOOD": ComicGrade.VG,

  "VG-": ComicGrade.VG_MINUS,
  VGMINUS: ComicGrade.VG_MINUS,
  "VG MINUS": ComicGrade.VG_MINUS,
  "VERYGOOD-": ComicGrade.VG_MINUS,
  "VERY GOOD-": ComicGrade.VG_MINUS,

  "GD/VG": ComicGrade.GD_VG,
  "GD-VG": ComicGrade.GD_VG,
  "GOOD/VERYGOOD": ComicGrade.GD_VG,
  "GOOD/VERY GOOD": ComicGrade.GD_VG,

  "GD+": ComicGrade.GD_PLUS,
  GDPLUS: ComicGrade.GD_PLUS,
  "GD PLUS": ComicGrade.GD_PLUS,
  "GOOD+": ComicGrade.GD_PLUS,
  "G+": ComicGrade.GD_PLUS,

  GD: ComicGrade.GD,
  GOOD: ComicGrade.GD,
  G: ComicGrade.GD,

  "GD-": ComicGrade.GD_MINUS,
  GDMINUS: ComicGrade.GD_MINUS,
  "GD MINUS": ComicGrade.GD_MINUS,
  "GOOD-": ComicGrade.GD_MINUS,
  "G-": ComicGrade.GD_MINUS,

  "FR/GD": ComicGrade.FR_GD,
  "FR-GD": ComicGrade.FR_GD,
  "FAIR/GOOD": ComicGrade.FR_GD,

  FR: ComicGrade.FR,
  FAIR: ComicGrade.FR,

  PR: ComicGrade.PR,
  POOR: ComicGrade.PR,
  P: ComicGrade.PR,

  // Special conditions
  UNGRADED: ComicGrade.UNGRADED,
  "NOT GRADED": ComicGrade.UNGRADED,
  "NO GRADE": ComicGrade.UNGRADED,
  NONE: ComicGrade.UNGRADED,
  "N/A": ComicGrade.UNGRADED,
  NA: ComicGrade.UNGRADED,
  "": ComicGrade.UNGRADED,

  RESTORED: ComicGrade.RESTORED,
  REST: ComicGrade.RESTORED,
  RESTORATION: ComicGrade.RESTORED,

  QUALIFIED: ComicGrade.QUALIFIED,
  QUAL: ComicGrade.QUALIFIED,
  Q: ComicGrade.QUALIFIED,

  // Special CGC/CBCS designations that could appear in grade field
  "SIGNATURE SERIES": ComicGrade.QUALIFIED, // Will go to gradeDetails
  "SIG SERIES": ComicGrade.QUALIFIED,
  SS: ComicGrade.QUALIFIED,
  "VERIFIED SIGNATURE": ComicGrade.QUALIFIED,
  AUTHENTIC: ComicGrade.QUALIFIED,
};

/**
 * Normalize grade input to ComicGrade enum value
 * Handles numeric grades, string grades, and common variations
 */
export const normalizeGradeInput = (
  input: GradeInput
): {
  grade: ComicGrade | null;
  gradeDetails: string | null;
  warnings: string[];
} => {
  const warnings: string[] = [];

  if (input === null || input === undefined) {
    return { grade: null, gradeDetails: null, warnings };
  }

  // Convert to string and normalize
  let normalizedInput = String(input).trim().toUpperCase();

  if (normalizedInput === "") {
    return { grade: ComicGrade.UNGRADED, gradeDetails: null, warnings };
  }

  // Handle special designations that should go to gradeDetails
  let gradeDetails: string | null = null;
  const specialDesignations = [
    "SIGNATURE SERIES",
    "SIG SERIES",
    "SS",
    "VERIFIED SIGNATURE",
    "AUTHENTIC",
    "RESTORED",
    "RESTORATION",
  ];

  for (const designation of specialDesignations) {
    if (normalizedInput.includes(designation)) {
      gradeDetails = designation;
      // Remove from grade input to get the base grade
      normalizedInput = normalizedInput.replace(designation, "").trim();
      break;
    }
  }

  // Remove common extra characters and normalize spacing
  normalizedInput = normalizedInput
    .replace(/[\s\-_\.]+/g, " ") // Normalize separators to single space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();

  // Try exact match first
  if (GRADE_INPUT_MAP[normalizedInput]) {
    return {
      grade: GRADE_INPUT_MAP[normalizedInput],
      gradeDetails,
      warnings,
    };
  }

  // Try without spaces (for things like "N M" -> "NM")
  const noSpaces = normalizedInput.replace(/\s/g, "");
  if (GRADE_INPUT_MAP[noSpaces]) {
    return {
      grade: GRADE_INPUT_MAP[noSpaces],
      gradeDetails,
      warnings,
    };
  }

  // Try numeric parsing for decimal grades
  const numericMatch = normalizedInput.match(/^(\d+(?:\.\d+)?)$/);
  if (numericMatch) {
    const numericKey = numericMatch[1];
    if (GRADE_INPUT_MAP[numericKey]) {
      return {
        grade: GRADE_INPUT_MAP[numericKey],
        gradeDetails,
        warnings,
      };
    }
  }

  // Handle partial matches for common typos
  const partialMatches: Record<string, ComicGrade> = {
    NEARMINT: ComicGrade.NM,
    VERYFINE: ComicGrade.VF,
    VERYGOOD: ComicGrade.VG,
  };

  for (const [partial, grade] of Object.entries(partialMatches)) {
    if (normalizedInput.includes(partial)) {
      warnings.push(`Partial match: "${input}" interpreted as "${grade}"`);
      return { grade, gradeDetails, warnings };
    }
  }

  // Failed to normalize
  warnings.push(`Could not parse grade: "${input}"`);
  return { grade: null, gradeDetails, warnings };
};

/**
 * Parse flexible date formats to Date object
 * Handles multiple common formats with smart detection
 */
export const parseFlexibleDate = (
  input: DateInput
): {
  date: Date | null;
  warnings: string[];
} => {
  const warnings: string[] = [];

  if (!input) {
    return { date: null, warnings };
  }

  if (input instanceof Date) {
    return { date: input, warnings };
  }

  const dateStr = String(input).trim();
  if (dateStr === "") {
    return { date: null, warnings };
  }

  // Try multiple date formats in order of preference
  const formats = [
    // ISO format (most reliable)
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD

    // US format (MM/DD/YYYY)
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY

    // European format (DD/MM/YYYY) - harder to detect, use context
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY (European style)

    // Short year formats
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // MM/DD/YY or DD/MM/YY
    /^(\d{1,2})-(\d{1,2})-(\d{2})$/, // MM-DD-YY or DD-MM-YY

    // Month/Year only (common for issue dates)
    /^(\d{1,2})\/(\d{4})$/, // MM/YYYY
    /^(\d{1,2})-(\d{4})$/, // MM-YYYY
    /^(\d{4})\/(\d{1,2})$/, // YYYY/MM
    /^(\d{4})-(\d{1,2})$/, // YYYY-MM
  ];

  // Try ISO date format first (built-in parsing)
  const isoAttempt = new Date(dateStr);
  if (!isNaN(isoAttempt.getTime()) && dateStr.includes("-")) {
    return { date: isoAttempt, warnings };
  }

  // Try manual parsing for various formats
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      try {
        let year: number = 0,
          month: number = 0,
          day: number = 1;

        if (
          format.source.includes("YYYY") &&
          format.source.startsWith("^(\\d{4})")
        ) {
          // YYYY-MM-DD or YYYY/MM/DD format
          [, year, month, day] = match.map(Number);
        } else if (format.source.includes("(\\d{4})$")) {
          // Formats ending with 4-digit year
          if (match.length === 4) {
            // MM/DD/YYYY or DD/MM/YYYY - need to guess
            const [, first, second, yearStr] = match;
            year = parseInt(yearStr);

            // Use context clues to determine MM/DD vs DD/MM
            const firstNum = parseInt(first);
            const secondNum = parseInt(second);

            if (firstNum > 12) {
              // Must be DD/MM format
              day = firstNum;
              month = secondNum;
            } else if (secondNum > 12) {
              // Must be MM/DD format
              month = firstNum;
              day = secondNum;
            } else {
              // Ambiguous - default to MM/DD (US format)
              month = firstNum;
              day = secondNum;
              warnings.push(
                `Date format ambiguous, assumed MM/DD: "${dateStr}"`
              );
            }
          } else if (match.length === 3) {
            // MM/YYYY format
            [, month, year] = match.map(Number);
            day = 1;
          }
        } else if (format.source.includes("(\\d{2})$")) {
          // Short year format (YY)
          const [, first, second, shortYear] = match;
          const currentYear = new Date().getFullYear();
          const century = Math.floor(currentYear / 100) * 100;

          // Assume 20XX for years 00-30, 19XX for years 31-99
          const yearNum = parseInt(shortYear);
          year = yearNum <= 30 ? century + yearNum : century - 100 + yearNum;

          // Same logic as above for MM/DD vs DD/MM
          const firstNum = parseInt(first);
          const secondNum = parseInt(second);

          if (firstNum > 12) {
            day = firstNum;
            month = secondNum;
          } else if (secondNum > 12) {
            month = firstNum;
            day = secondNum;
          } else {
            month = firstNum;
            day = secondNum;
            warnings.push(`Date format ambiguous, assumed MM/DD: "${dateStr}"`);
          }
        }

        // Validate the parsed date
        if (
          year &&
          month &&
          month >= 1 &&
          month <= 12 &&
          day >= 1 &&
          day <= 31
        ) {
          const parsedDate = new Date(year, month - 1, day); // Month is 0-indexed

          // Verify the date is valid (handles invalid dates like Feb 30)
          if (
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
          ) {
            return { date: parsedDate, warnings };
          }
        }
      } catch (error) {
        // Continue to next format
        continue;
      }
    }
  }

  // Failed to parse
  warnings.push(`Could not parse date: "${dateStr}"`);
  return { date: null, warnings };
};

/**
 * Normalize boolean-like inputs to actual boolean
 * Handles common variations like "Yes", "Y", "1", "true", etc.
 */
export const normalizeBooleanInput = (
  input: BooleanInput
): {
  value: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];

  if (input === null || input === undefined) {
    return { value: false, warnings };
  }

  if (typeof input === "boolean") {
    return { value: input, warnings };
  }

  if (typeof input === "number") {
    return { value: input > 0, warnings };
  }

  // String parsing
  const normalizedStr = String(input).trim().toLowerCase();

  const truthyValues = [
    "true",
    "yes",
    "y",
    "1",
    "on",
    "signed",
    "checked",
    "✓",
    "✅",
  ];

  const falsyValues = [
    "false",
    "no",
    "n",
    "0",
    "off",
    "unsigned",
    "unchecked",
    "",
    "none",
    "null",
  ];

  if (truthyValues.includes(normalizedStr)) {
    return { value: true, warnings };
  }

  if (falsyValues.includes(normalizedStr)) {
    return { value: false, warnings };
  }

  // Couldn't parse - default to false but warn
  warnings.push(
    `Could not parse boolean value: "${input}", defaulting to false`
  );
  return { value: false, warnings };
};

/**
 * Normalize numeric input (prices, values, etc.)
 * Handles currency symbols, commas, and other formatting
 */
export const normalizeNumericInput = (
  input: string | number | null | undefined,
  allowNegative: boolean = false
): { value: number | null; warnings: string[] } => {
  const warnings: string[] = [];

  if (input === null || input === undefined) {
    return { value: null, warnings };
  }

  if (typeof input === "number") {
    if (!allowNegative && input < 0) {
      warnings.push(`Negative value not allowed: ${input}, using 0`);
      return { value: 0, warnings };
    }
    return { value: input, warnings };
  }

  const str = String(input).trim();
  if (str === "") {
    return { value: null, warnings };
  }

  // Remove currency symbols and common formatting
  const cleaned = str
    .replace(/[\$,\s]/g, "") // Remove $, commas, spaces
    .replace(/[^\d\.-]/g, ""); // Keep only digits, dots, and minus

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    warnings.push(`Could not parse numeric value: "${input}"`);
    return { value: null, warnings };
  }

  if (!allowNegative && parsed < 0) {
    warnings.push(`Negative value not allowed: ${parsed}, using 0`);
    return { value: 0, warnings };
  }

  return { value: parsed, warnings };
};

/**
 * Normalize text input (trim, handle empty values)
 */
export const normalizeTextInput = (
  input: string | null | undefined,
  allowEmpty: boolean = true
): { value: string | null; warnings: string[] } => {
  const warnings: string[] = [];

  if (input === null || input === undefined) {
    return { value: null, warnings };
  }

  const trimmed = String(input).trim();

  if (trimmed === "" && !allowEmpty) {
    warnings.push("Empty text value where content was expected");
    return { value: null, warnings };
  }

  return { value: trimmed === "" ? null : trimmed, warnings };
};

/**
 * Determine if a comic should be marked as collected based on pricePaid
 * Logic: Any null, empty, or non-numeric pricePaid = not collected
 *        Any numeric pricePaid >= 0 = collected (supports free comics)
 */
export const determineCollectedStatus = (
  pricePaid: number | null | undefined,
  explicitCollected?: boolean
): boolean => {
  // If pricePaid exists and is a valid number >= 0, mark as collected
  if (typeof pricePaid === "number" && pricePaid >= 0) {
    return true;
  }

  // Otherwise, respect explicit collected status or default to false
  return explicitCollected || false;
};

/**
 * Comprehensive validation result type
 */
export interface NormalizationResult {
  isValid: boolean;
  data: any;
  warnings: string[];
  errors: string[];
}

/**
 * Main normalization function that processes all fields for a comic
 * This orchestrates all the individual normalization functions above
 */
export const normalizeComicFields = (rawData: any): NormalizationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  const normalized: any = {};

  // Core fields (required)
  const requiredFields = ["Publisher", "Series", "Issue"];
  for (const field of requiredFields) {
    const { value, warnings: fieldWarnings } = normalizeTextInput(
      rawData[field],
      false
    );
    if (!value) {
      errors.push(`Missing required field: ${field}`);
    } else {
      normalized[field.toLowerCase()] = value; // Store as lowercase keys
    }
    warnings.push(...fieldWarnings);
  }

  // Optional text fields - handle both original CSV names and normalized names
  const textFieldMappings = [
    { csvField: "Volume", dbField: "volume" },
    { csvField: "Years", dbField: "years" },
    { csvField: "Type", dbField: "type" },
    { csvField: "Notes", dbField: "notes" },
    { csvField: "CERT", dbField: "cert" },
    { csvField: "storageLocation", dbField: "storageLocation" }, // Already mapped from "Pile"
    { csvField: "variantDetails", dbField: "variantDetails" },
    { csvField: "storyTitle", dbField: "storyTitle" },
    { csvField: "description", dbField: "description" },
    { csvField: "writer", dbField: "writer" },
    { csvField: "artist", dbField: "artist" },
    { csvField: "coverArtist", dbField: "coverArtist" },
    { csvField: "letterer", dbField: "letterer" },
    { csvField: "firstAppearance", dbField: "firstAppearance" },
    { csvField: "coverImageUrl", dbField: "coverImageUrl" },
    { csvField: "certificationCompany", dbField: "certificationCompany" },
    { csvField: "Issue Date", dbField: "issueDate" },
  ];

  for (const { csvField, dbField } of textFieldMappings) {
    const { value, warnings: fieldWarnings } = normalizeTextInput(
      rawData[csvField]
    );
    normalized[dbField] = value;
    warnings.push(...fieldWarnings);
  }

  // Numeric fields
  const { value: currentValue, warnings: currentValueWarnings } =
    normalizeNumericInput(rawData["Current Value"] || rawData.currentValue);
  normalized.currentValue = currentValue || 0;
  warnings.push(...currentValueWarnings);

  const { value: pricePaid, warnings: pricePaidWarnings } =
    normalizeNumericInput(rawData["Price Paid"] || rawData.pricePaid);
  normalized.pricePaid = pricePaid;
  warnings.push(...pricePaidWarnings);

  // Issue number parsing (numeric version of issue)
  const { value: issueNumber, warnings: issueWarnings } = normalizeNumericInput(
    rawData.issueNumber || rawData.Issue || rawData.issue
  );
  normalized.issueNumber = issueNumber || 1;
  warnings.push(...issueWarnings);

  // Grade parsing
  const {
    grade,
    gradeDetails,
    warnings: gradeWarnings,
  } = normalizeGradeInput(rawData.Grade || rawData.grade);
  normalized.grade = grade;
  normalized.gradeDetails = gradeDetails;
  warnings.push(...gradeWarnings);

  // Boolean fields
  const { value: signed, warnings: signedWarnings } = normalizeBooleanInput(
    rawData.Signed || rawData.signed
  );
  normalized.signed = signed;
  warnings.push(...signedWarnings);

  // Date fields
  const { date: dateAdded, warnings: dateAddedWarnings } = parseFlexibleDate(
    rawData["Date Added"] || rawData.dateAdded
  );
  normalized.dateAdded = dateAdded;
  warnings.push(...dateAddedWarnings);

  const { date: datePurchased, warnings: datePurchasedWarnings } =
    parseFlexibleDate(rawData.datePurchased);
  normalized.datePurchased = datePurchased;
  warnings.push(...datePurchasedWarnings);

  // Determine collected status using smart logic
  normalized.collected = determineCollectedStatus(
    normalized.pricePaid,
    rawData.collected
  );

  // Preserve existing grail status or default to false
  normalized.isGrail = Boolean(rawData.isGrail);

  return {
    isValid: errors.length === 0,
    data: normalized,
    warnings,
    errors,
  };
};

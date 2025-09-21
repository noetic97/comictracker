/**
 * Validation Contract - Defines how validation works across the system
 * Now uses shared validation utilities for client-side use
 * Used by: hooks/useCSVImport, utils/csvParser, components
 */

// Re-export all validation interfaces and functions from shared validation
export type {
  ComicValidationOptions,
  ValidationResult,
  BulkValidationResult,
  ComicValidationResult,
} from "../utils/validation/sharedValidation";

export {
  validateComic,
  validateComicBatch,
  validateComicFields,
  normalizeComic,
  createComicKey,
  generateComicId,
  generateFavoriteSeriesId,
} from "../utils/validation/sharedValidation";

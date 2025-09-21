/**
 * Validation Contract - Defines how validation works across the system
 * Used by: utils/comicValidator, hooks/useCSVImport, utils/csvParser, components
 */

export interface ComicValidationOptions {
  requireNumericIssue?: boolean;
  allowEmptyVolume?: boolean;
  allowEmptyType?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BatchValidationResult {
  total: number;
  valid: number;
  invalid: number;
  validComics: any[];
  invalidComics: Array<{
    index: number;
    data: any;
    errors: string[];
    warnings: string[];
  }>;
  errors: string[];
  warnings: string[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

// From CSV validation
export interface ComicValidationResult {
  isValid: boolean;
  comic?: any;
  errors: string[];
  warnings: string[];
  skippedFields: string[];
}

// Backend validation contracts (shared with functions/comics/validation.ts)
export interface ExtendedComicInput {
  // Core fields (required)
  publisher: string;
  series: string;
  issue: string;

  // All optional fields...
  issueNumber?: string | number;
  currentValue?: string | number;
  // ... rest of extended fields
}

export interface BulkValidationResult {
  validComics: any[];
  validationErrors: string[];
  totalProcessed: number;
}

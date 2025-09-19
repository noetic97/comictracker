/**
 * Validation Contract - Defines how validation works across the system
 * Used by: utils/comicValidator, hooks/useCSVImport, utils/csvParser
 */

export interface ValidationOptions {
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

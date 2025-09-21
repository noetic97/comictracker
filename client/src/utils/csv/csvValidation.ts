import { validateComicFields } from "../validation/simpleFieldValidator";

// Validation result types

export interface ComicValidationResult {
  isValid: boolean;
  comic?: any;
  errors: string[];
  warnings: string[];
  skippedFields: string[];
}

export interface BatchValidationResult {
  validComics: any[];
  invalidComics: any[];
  warnings: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warningCount: number;
  };
}

/**
 * Validate and normalize a single comic record
 */
export const validateComicRecord = (
  rawData: any, // TODO: fix this
  rowIndex: number
): ComicValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const skippedFields: string[] = [];

  // Use the comprehensive normalization from gradeNormalization.ts
  const normalizationResult = validateComicFields(rawData);

  // Add row context to warnings and errors
  const contextualWarnings = normalizationResult.warnings.map(
    (warning) => `Row ${rowIndex + 1}: ${warning}`
  );
  const contextualErrors = normalizationResult.errors.map(
    (error) => `Row ${rowIndex + 1}: ${error}`
  );

  return {
    isValid: normalizationResult.isValid,
    comic: normalizationResult.isValid ? normalizationResult.comic : undefined,
    errors: contextualErrors,
    warnings: contextualWarnings,
    skippedFields, // Could be populated with fields that couldn't be mapped
  };
};

/**
 * Validate a batch of comic records with detailed reporting
 */
export const validateComicBatch = (rawComics: any[]): BatchValidationResult => {
  const validComics: any[] = [];
  const invalidComics: any[] = [];
  const allWarnings: string[] = [];

  rawComics.forEach((comic, index) => {
    const result = validateComicRecord(comic, index);

    if (result.isValid && result.comic) {
      validComics.push({
        ...result.comic,
        originalIndex: index, // Track original position for error reporting
      });
    } else {
      invalidComics.push({
        originalIndex: index,
        data: comic,
        errors: result.errors,
        warnings: result.warnings,
        skippedFields: result.skippedFields,
      });
    }

    // Collect all warnings
    allWarnings.push(...result.warnings);
  });

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
 * Validate that a CSV file has acceptable structure before processing
 */
export const validateCSVStructure = (
  headers: string[],
  sampleRows: any[], // TODO: fix this
  maxSampleSize: number = 5
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number;
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let confidence = 1.0;

  // Check for empty headers
  const emptyHeaders = headers.filter((h) => !h || h.trim() === "");
  if (emptyHeaders.length > 0) {
    warnings.push(`Found ${emptyHeaders.length} empty header(s)`);
    confidence -= 0.1;
  }

  // Check for duplicate headers
  const headerCounts = new Map<string, number>();
  headers.forEach((header) => {
    const normalized = header.trim().toLowerCase();
    headerCounts.set(normalized, (headerCounts.get(normalized) || 0) + 1);
  });

  const duplicates = Array.from(headerCounts.entries()).filter(
    ([_, count]) => count > 1
  );
  if (duplicates.length > 0) {
    errors.push(
      `Duplicate headers found: ${duplicates
        .map(([header]) => header)
        .join(", ")}`
    );
    confidence -= 0.3;
  }

  // Check sample data quality
  if (sampleRows.length === 0) {
    errors.push("No data rows found in CSV");
    confidence = 0;
  } else {
    // Check for completely empty rows
    const emptyRowCount = sampleRows.filter((row) =>
      Object.values(row).every((value) => !value || String(value).trim() === "")
    ).length;

    if (emptyRowCount === sampleRows.length) {
      errors.push("All sample rows appear to be empty");
      confidence -= 0.5;
    } else if (emptyRowCount > 0) {
      warnings.push(
        `${emptyRowCount}/${sampleRows.length} sample rows appear to be empty`
      );
      confidence -= 0.1;
    }

    // Check for required field coverage in sample data
    const requiredFields = ["Publisher", "Series", "Issue"];
    const sampleValidation = sampleRows.map((row, index) =>
      validateComicRecord(row, index)
    );

    const validSampleCount = sampleValidation.filter(
      (result) => result.isValid
    ).length;
    const sampleValidationRate = validSampleCount / sampleRows.length;

    if (sampleValidationRate < 0.5) {
      warnings.push(
        `Only ${Math.round(
          sampleValidationRate * 100
        )}% of sample rows appear valid`
      );
      confidence -= 0.2;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    confidence: Math.max(0, confidence),
  };
};

/**
 * Generate a detailed validation report
 */
export const generateValidationReport = (
  headers: string[],
  sampleRows: any[], // TODO: fix this
  batchResult?: BatchValidationResult
): string => {
  const lines = [
    `CSV VALIDATION REPORT`,
    `====================`,
    ``,
    `STRUCTURE:`,
    `- Headers: ${headers.length}`,
    `- Sample Rows: ${sampleRows.length}`,
  ];

  if (batchResult) {
    lines.push(
      ``,
      `VALIDATION RESULTS:`,
      `- Total Records: ${batchResult.summary.total.toLocaleString()}`,
      `- Valid Records: ${batchResult.summary.valid.toLocaleString()}`,
      `- Invalid Records: ${batchResult.summary.invalid.toLocaleString()}`,
      `- Success Rate: ${(
        (batchResult.summary.valid / batchResult.summary.total) *
        100
      ).toFixed(1)}%`,
      `- Total Warnings: ${batchResult.summary.warningCount.toLocaleString()}`
    );

    if (batchResult.warnings.length > 0) {
      lines.push(``, `COMMON WARNINGS (first 10):`);
      // Group similar warnings
      const warningGroups = new Map<string, number>();
      batchResult.warnings.forEach((warning: string) => {
        const baseWarning = warning.replace(/Row \d+: /, "");
        warningGroups.set(
          baseWarning,
          (warningGroups.get(baseWarning) || 0) + 1
        );
      });

      Array.from(warningGroups.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([warning, count]) => {
          lines.push(`- ${warning} (${count} occurrences)`);
        });
    }

    if (batchResult.invalidComics.length > 0) {
      lines.push(``, `INVALID RECORDS (first 5):`);
      batchResult.invalidComics.slice(0, 5).forEach((invalid: any) => {
        lines.push(
          `- Row ${invalid.originalIndex + 1}: ${invalid.errors.join(", ")}`
        );
      });

      if (batchResult.invalidComics.length > 5) {
        lines.push(
          `- ... and ${
            batchResult.invalidComics.length - 5
          } more invalid records`
        );
      }
    }
  }

  return lines.join("\n");
};

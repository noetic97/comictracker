import Papa from "papaparse";
import { Comic } from "../../types/index.ts";
import {
  detectCSVFormat,
  normalizeCSVRow,
  CSVFormat,
} from "./csvFormatDetection";
import { validateComicBatch } from "./csvValidation.ts";

// Enhanced parse result with detailed reporting
export interface EnhancedParseResult {
  validComics: Comic[];
  invalidRows: any[];
  detectedFormat: CSVFormat;
  warnings: string[];
  summary: {
    totalRows: number;
    validComics: number;
    invalidRows: number;
    collectedComics: number; // Auto-determined from pricePaid
    wantListComics: number; // Comics without pricePaid
    warningCount: number;
  };
  fieldMapping: Record<string, string>;
}

/**
 * Main enhanced CSV parser function with auto-detection
 */
export const parseComicsCSVEnhanced = async (
  file: File
): Promise<EnhancedParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for better normalization control
      transformHeader: (header: string) => header.trim(), // Clean headers

      complete: (results) => {
        try {
          const { data, meta } = results;
          const headers = meta.fields || [];

          console.log(
            `📊 CSV Parse Complete: ${data.length} rows, ${headers.length} columns`
          );
          console.log(`📋 Headers: ${headers.join(", ")}`);

          // Detect format and create field mapping
          const detection = detectCSVFormat(headers);
          console.log(
            `🔍 Format Detection: ${detection.format} (${Math.round(
              detection.confidence * 100
            )}% confidence)`
          );
          console.log(`🧠 Reasoning: ${detection.reasoning.join("; ")}`);

          // Normalize all rows using field mapping
          const normalizedRows = data.map((row) =>
            normalizeCSVRow(row, detection.fieldMapping)
          );

          // Validate and normalize with detailed reporting
          const validationResult = validateComicBatch(normalizedRows);

          console.log(`✅ Normalization Complete:`, validationResult.summary);

          // Determine collected vs want list comics
          const collectedComics = validationResult.validComics.filter(
            (comic) => comic.collected
          );
          const wantListComics = validationResult.validComics.filter(
            (comic) => !comic.collected
          );

          console.log(
            `📈 Collection Status: ${collectedComics.length} collected, ${wantListComics.length} want list`
          );

          // Generate final comics with proper IDs
          const finalComics: Comic[] = validationResult.validComics.map(
            (comic, index) => ({
              ...comic,
              id: `import-${Date.now()}-${index}`, // Temporary ID for import
            })
          );

          const result: EnhancedParseResult = {
            validComics: finalComics,
            invalidRows: validationResult.invalidComics,
            detectedFormat: detection.format,
            warnings: [...detection.reasoning, ...validationResult.warnings],
            summary: {
              totalRows: data.length,
              validComics: finalComics.length,
              invalidRows: validationResult.invalidComics.length,
              collectedComics: collectedComics.length,
              wantListComics: wantListComics.length,
              warningCount: validationResult.warnings.length,
            },
            fieldMapping: detection.fieldMapping,
          };

          resolve(result);
        } catch (error) {
          console.error("❌ CSV processing error:", error);
          reject(
            new Error(
              `CSV processing failed: ${
                error instanceof Error ? error.message : String(error)
              }`
            )
          );
        }
      },

      error: (error) => {
        console.error("❌ CSV parsing error:", error);
        reject(
          new Error(
            `CSV parsing failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      },
    });
  });
};

/**
 * Enhanced CSV parsing with format detection and auto-collection logic
 */
export const parseComicsCSVWithAutoDetection = async (
  file: File
): Promise<EnhancedParseResult> => {
  console.log(`📁 Starting enhanced CSV parsing for: ${file.name}`);
  console.log(`📊 File size: ${(file.size / 1024).toFixed(1)} KB`);

  try {
    const result = await parseComicsCSVEnhanced(file);

    // Log detailed results
    console.log(`🎉 Parse Results:`);
    console.log(
      `   Format: ${result.detectedFormat} (${
        Object.keys(result.fieldMapping).length
      } fields mapped)`
    );
    console.log(
      `   Valid: ${result.summary.validComics}/${result.summary.totalRows} comics`
    );
    console.log(
      `   Collected: ${result.summary.collectedComics} (auto-detected from Price Paid)`
    );
    console.log(
      `   Want List: ${result.summary.wantListComics} (no Price Paid)`
    );
    console.log(`   Invalid: ${result.summary.invalidRows} rows`);
    console.log(`   Warnings: ${result.summary.warningCount}`);

    // Log sample of detected data for debugging
    if (result.validComics.length > 0) {
      console.log(`📋 Sample Valid Comic:`, {
        publisher: result.validComics[0].publisher,
        series: result.validComics[0].series,
        issue: result.validComics[0].issue,
        pricePaid: result.validComics[0].pricePaid,
        collected: result.validComics[0].collected,
        grade: result.validComics[0].grade,
      });
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️ Sample Warnings:`, result.warnings.slice(0, 5));
    }

    return result;
  } catch (error) {
    console.error(`❌ Enhanced CSV parsing failed:`, error);
    throw new Error(
      `Failed to parse CSV: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Helper function to preview CSV structure without full parsing
 */
export const previewCSVStructure = async (
  file: File,
  maxRows: number = 5
): Promise<{
  headers: string[];
  sampleRows: any[];
  detectedFormat: CSVFormat;
  fieldMapping: Record<string, string>;
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      preview: maxRows,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),

      complete: (results) => {
        const headers = results.meta.fields || [];
        const detection = detectCSVFormat(headers);

        resolve({
          headers,
          sampleRows: results.data,
          detectedFormat: detection.format,
          fieldMapping: detection.fieldMapping,
        });
      },

      error: (error) => {
        reject(
          new Error(
            `CSV preview failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      },
    });
  });
};

/**
 * Backward compatibility wrapper for existing parseComicsCSV function
 * This maintains the existing API while using the enhanced parser internally
 */
export const parseComicsCSV = async (
  file: File
): Promise<{
  validComics: Comic[];
  invalidRows: any[];
}> => {
  const enhancedResult = await parseComicsCSVWithAutoDetection(file);

  return {
    validComics: enhancedResult.validComics,
    invalidRows: enhancedResult.invalidRows,
  };
};

/**
 * Utility to check if a CSV file looks valid before attempting full parse
 */
export const validateCSVFile = async (
  file: File
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview: {
    headers: string[];
    sampleRows: any[];
    detectedFormat: CSVFormat;
  } | null;
}> => {
  try {
    const preview = await previewCSVStructure(file, 3);

    const errors: string[] = [];
    const warnings: string[] = [];

    if (preview.detectedFormat === "unknown") {
      warnings.push(
        "Could not detect CSV format - will attempt best-effort parsing"
      );
    }

    if (preview.sampleRows.length === 0) {
      errors.push("CSV appears to be empty or contains no valid data rows");
    }

    // Check for minimum required headers
    const requiredHeaders = ["Publisher", "Series", "Issue"];
    const missingHeaders = requiredHeaders.filter(
      (required) =>
        !preview.headers.some((header) =>
          header.toLowerCase().includes(required.toLowerCase())
        )
    );

    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      preview: {
        headers: preview.headers,
        sampleRows: preview.sampleRows,
        detectedFormat: preview.detectedFormat,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Failed to validate CSV: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      warnings: [],
      preview: null,
    };
  }
};

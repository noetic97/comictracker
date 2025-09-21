import { formatTimestamp, formatNumber } from "./formatters";
import { AnalysisResult } from "../contracts/analysis";
import { ImportResults } from "../hooks/types";

interface ReportOptions {
  includeTimestamp?: boolean;
  maxMissingItems?: number;
  maxInvalidItems?: number;
  maxDuplicateItems?: number;
  includeDebuggingNotes?: boolean;
}

/**
 * Generate a comprehensive missing comics analysis report
 */
export const generateMissingComicsReport = (
  analysis: AnalysisResult,
  options: ReportOptions = {}
): string => {
  const {
    includeTimestamp = true,
    maxMissingItems = 50,
    maxInvalidItems = 20,
    maxDuplicateItems = 20,
    includeDebuggingNotes = true,
  } = options;

  const sections: string[] = [];

  // Header
  sections.push("MISSING COMICS ANALYSIS REPORT");
  sections.push("=".repeat(60));

  if (includeTimestamp) {
    sections.push(`Generated: ${formatTimestamp(new Date())}`);
    sections.push("");
  }

  // Summary
  sections.push("SUMMARY");
  sections.push("-".repeat(30));
  sections.push(`Total comics in file: ${formatNumber(analysis.totalInFile)}`);
  sections.push(
    `Total comics in database: ${formatNumber(analysis.totalInDatabase)}`
  );
  sections.push(`Missing comics: ${formatNumber(analysis.missing.length)}`);
  sections.push(
    `Invalid comics: ${formatNumber(analysis.invalidComics.length)}`
  );
  sections.push(
    `Duplicates in file: ${formatNumber(analysis.duplicatesInFile.length)}`
  );
  sections.push(
    `Type mismatches: ${formatNumber(analysis.typeMismatches.length)}`
  );
  sections.push("");

  // Missing Comics
  if (analysis.missing.length > 0) {
    sections.push("MISSING COMICS");
    sections.push("-".repeat(60));
    sections.push(
      "Publisher | Series | Volume | Issue | Type | Value | Reason"
    );
    sections.push("-".repeat(60));

    const itemsToShow = Math.min(analysis.missing.length, maxMissingItems);
    for (let i = 0; i < itemsToShow; i++) {
      const comic = analysis.missing[i];
      sections.push(
        `${comic.publisher} | ${comic.series} | ${comic.volume} | #${comic.issue} | ${comic.type} | ${comic.currentValue} | ${comic.reason}`
      );
    }

    if (analysis.missing.length > maxMissingItems) {
      sections.push(
        `... and ${
          analysis.missing.length - maxMissingItems
        } more missing comics`
      );
    }
    sections.push("");
  }

  // Type Mismatches
  if (analysis.typeMismatches.length > 0) {
    sections.push("TYPE MISMATCHES");
    sections.push("-".repeat(60));
    sections.push(
      "Publisher | Series | Volume | Issue | File Type | Database Types"
    );
    sections.push("-".repeat(60));

    analysis.typeMismatches.forEach((mismatch) => {
      sections.push(
        `${mismatch.publisher} | ${mismatch.series} | ${mismatch.volume} | #${
          mismatch.issue
        } | ${mismatch.fileType} | ${mismatch.databaseTypes.join(", ")}`
      );
    });
    sections.push("");
  }

  // Invalid Comics
  if (analysis.invalidComics.length > 0) {
    sections.push("INVALID COMICS");
    sections.push("-".repeat(60));
    sections.push("Row | Reason | Data");
    sections.push("-".repeat(60));

    const itemsToShow = Math.min(
      analysis.invalidComics.length,
      maxInvalidItems
    );
    for (let i = 0; i < itemsToShow; i++) {
      const comic = analysis.invalidComics[i];
      sections.push(
        `Row ${comic.index}: ${comic.reason} | ${JSON.stringify(
          comic.data,
          null,
          2
        ).replace(/\n/g, " ")}`
      );
    }

    if (analysis.invalidComics.length > maxInvalidItems) {
      sections.push(
        `... and ${
          analysis.invalidComics.length - maxInvalidItems
        } more invalid comics`
      );
    }
    sections.push("");
  }

  // Duplicates in File
  if (analysis.duplicatesInFile.length > 0) {
    sections.push("DUPLICATES IN FILE");
    sections.push("-".repeat(60));
    sections.push(
      "Publisher | Series | Volume | Issue | Type | Count | File Rows"
    );
    sections.push("-".repeat(60));

    const itemsToShow = Math.min(
      analysis.duplicatesInFile.length,
      maxDuplicateItems
    );
    for (let i = 0; i < itemsToShow; i++) {
      const duplicate = analysis.duplicatesInFile[i];
      const rows = duplicate.fileIndices.map((idx) => idx + 1).join(", ");
      sections.push(
        `${duplicate.publisher} | ${duplicate.series} | ${duplicate.volume} | #${duplicate.issue} | ${duplicate.type} | ${duplicate.count} | Rows: ${rows}`
      );
    }

    if (analysis.duplicatesInFile.length > maxDuplicateItems) {
      sections.push(
        `... and ${
          analysis.duplicatesInFile.length - maxDuplicateItems
        } more duplicates`
      );
    }
    sections.push("");
  }

  // Debugging Notes
  if (includeDebuggingNotes) {
    sections.push("DEBUGGING NOTES");
    sections.push("-".repeat(30));
    sections.push(
      "1. Type field (Issue/Annual/Giant Size) is now included in uniqueness check"
    );
    sections.push(
      "2. Issue numbers like 'FCBD', 'Ashcan #1' are handled as special cases"
    );
    sections.push(
      "3. Type mismatches show when a comic exists with different type"
    );
    sections.push("4. Missing comics may be due to:");
    sections.push("   - Actually missing from database");
    sections.push("   - Type field differences");
    sections.push("   - Special character encoding issues");
    sections.push("   - Whitespace differences in publisher/series names");
    sections.push("5. Check console logs for additional debugging information");
    sections.push("");
  }

  return sections.join("\n");
};

/**
 * Generate a summary report for import results
 */
export const generateImportSummaryReport = (results: {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  processingTime: number;
  chunks?: number;
}): string => {
  const sections: string[] = [];

  sections.push("IMPORT SUMMARY REPORT");
  sections.push("=".repeat(40));
  sections.push(`Generated: ${formatTimestamp(new Date())}`);
  sections.push("");

  sections.push("RESULTS");
  sections.push("-".repeat(20));
  sections.push(`Comics processed: ${formatNumber(results.processed)}`);
  sections.push(`Comics created: ${formatNumber(results.created)}`);
  sections.push(`Comics updated: ${formatNumber(results.updated)}`);
  sections.push(`Errors: ${formatNumber(results.errors)}`);

  if (results.chunks) {
    sections.push(`Chunks processed: ${formatNumber(results.chunks)}`);
  }

  sections.push("");
  sections.push("PERFORMANCE");
  sections.push("-".repeat(20));
  sections.push(`Total time: ${formatDuration(results.processingTime)}`);

  const rate = Math.round((results.processed / results.processingTime) * 1000);
  sections.push(`Processing rate: ${formatNumber(rate)} comics/second`);

  if (results.errors > 0) {
    const errorRate = (results.errors / results.processed) * 100;
    sections.push(`Error rate: ${errorRate.toFixed(2)}%`);
  }

  return sections.join("\n");
};

/**
 * Download a report as a text file
 */
export const downloadReport = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 */
export const generateReportFilename = (
  baseName: string,
  extension: string = "txt"
): string => {
  const date = new Date();
  const timestamp = date.toISOString().split("T")[0]; // YYYY-MM-DD
  return `${baseName}-${timestamp}.${extension}`;
};

// Helper function to format duration (avoid circular dependency)
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * NEW: Generate CSV export for missing comics
 */
export const generateMissingComicsCSV = (analysis: AnalysisResult): string => {
  const headers =
    [
      "Publisher",
      "Series",
      "Volume",
      "Issue",
      "Type",
      "Current Value",
      "Reason",
      "File Row",
    ].join(",") + "\n";

  const rows = analysis.missing
    .map((comic) => {
      // Escape CSV values that contain commas or quotes
      const escapeCSV = (value: string | number) => {
        const str = String(value || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCSV(comic.publisher),
        escapeCSV(comic.series),
        escapeCSV(comic.volume),
        escapeCSV(comic.issue),
        escapeCSV(comic.type),
        comic.currentValue || 0,
        escapeCSV(comic.reason),
        comic.fileIndex + 1, // Convert to 1-based row number
      ].join(",");
    })
    .join("\n");

  return headers + rows;
};

/**
 * NEW: Generate comprehensive import + analysis report
 */
export const generateComprehensiveReport = (
  importResults: ImportResults,
  analysisResults?: AnalysisResult
): string => {
  const sections: string[] = [];

  // Header
  sections.push("COMPREHENSIVE IMPORT REPORT");
  sections.push("=".repeat(60));
  sections.push(`Generated: ${formatTimestamp(new Date())}`);
  sections.push("");

  // Import Summary
  sections.push("IMPORT SUMMARY");
  sections.push("-".repeat(30));
  sections.push(`Comics processed: ${formatNumber(importResults.processed)}`);
  sections.push(`Comics created: ${formatNumber(importResults.created)}`);
  sections.push(`Comics updated: ${formatNumber(importResults.updated)}`);
  sections.push(`Errors: ${formatNumber(importResults.errors)}`);
  sections.push(`Total time: ${formatDuration(importResults.processingTime)}`);

  const rate = Math.round(
    (importResults.processed / importResults.processingTime) * 1000
  );
  sections.push(`Processing rate: ${formatNumber(rate)} comics/second`);

  if (importResults.errors > 0) {
    const errorRate = (importResults.errors / importResults.processed) * 100;
    sections.push(`Error rate: ${errorRate.toFixed(2)}%`);
  }
  sections.push("");

  // Analysis Results (if provided)
  if (analysisResults) {
    sections.push("ANALYSIS RESULTS");
    sections.push("-".repeat(30));
    sections.push(
      `Total comics in file: ${formatNumber(analysisResults.totalInFile)}`
    );
    sections.push(
      `Total comics in database: ${formatNumber(
        analysisResults.totalInDatabase
      )}`
    );
    sections.push(
      `Missing comics: ${formatNumber(analysisResults.missing.length)}`
    );
    sections.push(
      `Invalid comics: ${formatNumber(analysisResults.invalidComics.length)}`
    );
    sections.push(
      `File duplicates: ${formatNumber(
        analysisResults.duplicatesInFile.length
      )}`
    );
    sections.push(
      `Type mismatches: ${formatNumber(analysisResults.typeMismatches.length)}`
    );
    sections.push("");

    // Top Missing Comics
    if (analysisResults.missing.length > 0) {
      sections.push("TOP MISSING COMICS (first 10)");
      sections.push("-".repeat(50));
      sections.push("Publisher | Series | Issue | Value | Reason");
      sections.push("-".repeat(50));

      analysisResults.missing.slice(0, 10).forEach((comic) => {
        sections.push(
          `${comic.publisher} | ${comic.series} | #${comic.issue} | ${comic.currentValue} | ${comic.reason}`
        );
      });
      sections.push("");
    }
  }

  // Recommendations
  sections.push("RECOMMENDATIONS");
  sections.push("-".repeat(30));

  const recommendations = generateSmartRecommendations(
    importResults,
    analysisResults
  );
  recommendations.forEach((rec) => {
    sections.push(`• ${rec}`);
  });

  if (recommendations.length === 0) {
    sections.push(
      "• No specific recommendations - import completed successfully"
    );
  }

  sections.push("");
  sections.push(
    "For detailed analysis, download the Missing Comics Analysis report."
  );

  return sections.join("\n");
};

/**
 * NEW: Generate smart recommendations based on import and analysis results
 */
export const generateSmartRecommendations = (
  importResults: ImportResults,
  analysisResults?: AnalysisResult
): string[] => {
  const recommendations: string[] = [];

  // Import-based recommendations
  if (importResults.errors > importResults.processed * 0.1) {
    recommendations.push(
      "High error rate detected - review CSV format and data quality"
    );
  }

  if (importResults.updated > importResults.created * 2) {
    recommendations.push(
      "Mostly updates rather than new comics - check for duplicate imports"
    );
  }

  if (importResults.processingTime > 30000 && importResults.processed < 1000) {
    recommendations.push(
      "Slow processing detected - consider smaller batch sizes for large files"
    );
  }

  // Analysis-based recommendations
  if (analysisResults) {
    if (analysisResults.typeMismatches.length > 5) {
      recommendations.push(
        "Standardize Type field values (Issue, Annual, Special, etc.)"
      );
    }

    if (
      analysisResults.duplicatesInFile.length >
      analysisResults.missing.length * 0.1
    ) {
      recommendations.push("Remove duplicate rows from CSV before importing");
    }

    if (
      analysisResults.invalidComics.length >
      analysisResults.totalInFile * 0.05
    ) {
      recommendations.push(
        "High number of invalid entries - verify CSV header format"
      );
    }

    if (analysisResults.missing.length === 0) {
      recommendations.push(
        "Excellent! All comics from your file are already in your collection"
      );
    } else if (analysisResults.missing.length > 50) {
      recommendations.push(
        "Consider creating a want list from missing comics for future purchases"
      );
    }

    // Value-based recommendations
    const highValueMissing = analysisResults.missing.filter(
      (comic) => comic.currentValue > 100
    );
    if (highValueMissing.length > 0) {
      recommendations.push(
        `${highValueMissing.length} high-value comics (>$100) are missing from your collection`
      );
    }
  }

  return recommendations;
};

/**
 * NEW: Generate error report for detailed troubleshooting
 */
export const generateErrorReport = (
  importResults: ImportResults,
  analysisResults?: AnalysisResult
): string => {
  const sections: string[] = [];

  sections.push("ERROR ANALYSIS REPORT");
  sections.push("=".repeat(50));
  sections.push(`Generated: ${formatTimestamp(new Date())}`);
  sections.push("");

  // Processing Errors
  if (
    importResults.processingErrors &&
    importResults.processingErrors.length > 0
  ) {
    sections.push("PROCESSING ERRORS");
    sections.push("-".repeat(30));
    importResults.processingErrors.forEach((error, index) => {
      sections.push(`${index + 1}. ${error}`);
    });
    sections.push("");
  }

  // Validation Warnings
  if (
    importResults.validationWarnings &&
    importResults.validationWarnings.length > 0
  ) {
    sections.push("VALIDATION WARNINGS");
    sections.push("-".repeat(30));
    importResults.validationWarnings.forEach((warning, index) => {
      sections.push(`${index + 1}. ${warning}`);
    });
    sections.push("");
  }

  // Invalid Comics from Analysis
  if (analysisResults && analysisResults.invalidComics.length > 0) {
    sections.push("INVALID COMIC ENTRIES");
    sections.push("-".repeat(50));
    sections.push("Row | Reason | Data");
    sections.push("-".repeat(50));

    analysisResults.invalidComics.slice(0, 20).forEach((comic) => {
      const dataStr = JSON.stringify(comic.data).substring(0, 100);
      sections.push(`${comic.index} | ${comic.reason} | ${dataStr}...`);
    });

    if (analysisResults.invalidComics.length > 20) {
      sections.push(
        `... and ${
          analysisResults.invalidComics.length - 20
        } more invalid entries`
      );
    }
    sections.push("");
  }

  // Troubleshooting Tips
  sections.push("TROUBLESHOOTING TIPS");
  sections.push("-".repeat(30));
  sections.push("1. Ensure CSV has required headers: Publisher, Series, Issue");
  sections.push("2. Check for special characters or encoding issues");
  sections.push(
    "3. Verify numeric fields (Current Value, Price Paid) contain valid numbers"
  );
  sections.push("4. Remove or fix empty rows in your CSV file");
  sections.push(
    "5. Ensure Issue numbers are consistent (avoid mixing '1' and 'Issue 1')"
  );
  sections.push("");

  return sections.join("\n");
};

/**
 * NEW: Export analysis results as JSON for advanced users
 */
export const generateAnalysisJSON = (
  analysisResults: AnalysisResult
): string => {
  const exportData = {
    summary: {
      totalInFile: analysisResults.totalInFile,
      totalInDatabase: analysisResults.totalInDatabase,
      missingCount: analysisResults.missing.length,
      duplicateCount: analysisResults.duplicatesInFile.length,
      invalidCount: analysisResults.invalidComics.length,
      typeMismatchCount: analysisResults.typeMismatches.length,
      generatedAt: new Date().toISOString(),
    },
    missing: analysisResults.missing,
    duplicatesInFile: analysisResults.duplicatesInFile,
    invalidComics: analysisResults.invalidComics,
    typeMismatches: analysisResults.typeMismatches,
  };

  return JSON.stringify(exportData, null, 2);
};

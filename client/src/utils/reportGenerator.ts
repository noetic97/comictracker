import { formatTimestamp, formatNumber } from "./formatters";
import { AnalysisResult } from "../contracts/analysis";

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

/**
 * Helper function to format duration (copied here to avoid circular dependency)
 */
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

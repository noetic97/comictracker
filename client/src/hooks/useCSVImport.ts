import { useState, useCallback } from "react";
import { parseComicsCSV } from "../utils/csvParser";
import { validateComicBatch, normalizeComic } from "../utils/comicValidator";
import {
  processComicsInChunks,
  ProcessingResult,
} from "../utils/chunkProcessor";
import { formatImportStats } from "../utils/formatters";

export interface ImportState {
  isImporting: boolean;
  progress: ImportProgress | null;
  results: ImportResults | null;
  error: string | null;
  warning: string | null;
}

export interface ImportProgress {
  total: number;
  processed: number;
  chunks: number;
  currentChunk: number;
  created: number;
  updated: number;
  errors: number;
  isComplete: boolean;
  startTime: number;
  estimatedTimeRemaining: number;
  rate: number;
}

export interface ImportResults {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  processingTime: number;
  processingErrors?: string[];
  validationWarnings?: string[];
}

export interface ImportOptions {
  chunkSize?: number;
  delayBetweenChunks?: number;
  validateComics?: boolean;
}

export const useCSVImport = (
  onImportComplete?: (results: ImportResults) => void
) => {
  const [state, setState] = useState<ImportState>({
    isImporting: false,
    progress: null,
    results: null,
    error: null,
    warning: null,
  });

  const updateState = useCallback((updates: Partial<ImportState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isImporting: false,
      progress: null,
      results: null,
      error: null,
      warning: null,
    });
  }, []);

  const importCSV = useCallback(
    async (file: File, options: ImportOptions = {}) => {
      const {
        chunkSize = 1000,
        delayBetweenChunks = 500,
        validateComics = true,
      } = options;

      try {
        // Reset state and start import
        updateState({
          isImporting: true,
          progress: null,
          results: null,
          error: null,
          warning: null,
        });

        console.log("📁 Parsing CSV file...");

        // Parse CSV
        const { validComics: rawComics, invalidRows } = await parseComicsCSV(
          file
        );

        if (rawComics.length === 0) {
          updateState({
            isImporting: false,
            error:
              "No valid comic data found in the CSV file. Please check the file format and try again.",
          });
          return null;
        }

        console.log(
          `✅ Parsed ${rawComics.length} valid comics, ${invalidRows.length} invalid rows`
        );

        // Validate and normalize comics if requested
        let processedComics = rawComics;
        let validationWarnings: string[] = [];

        if (validateComics) {
          const validation = validateComicBatch(rawComics);
          processedComics = validation.validComics.map(normalizeComic);
          validationWarnings = validation.warnings;

          if (validation.hasErrors) {
            console.warn("Validation errors found:", validation.errors);
          }
        } else {
          processedComics = rawComics.map(normalizeComic);
        }

        // Initialize progress
        const initialProgress: ImportProgress = {
          total: processedComics.length,
          processed: 0,
          chunks: Math.ceil(processedComics.length / chunkSize),
          currentChunk: 0,
          created: 0,
          updated: 0,
          errors: 0,
          isComplete: false,
          startTime: Date.now(),
          estimatedTimeRemaining: 0,
          rate: 0,
        };

        updateState({ progress: initialProgress });

        // Process comics
        console.log(
          `🚀 Starting import of ${
            processedComics.length
          } comics in ${Math.ceil(processedComics.length / chunkSize)} chunks`
        );

        const processingResult: ProcessingResult = await processComicsInChunks(
          processedComics,
          {
            chunkSize,
            delayBetweenChunks,
            onProgress: (chunkProgress) => {
              const progress: ImportProgress = {
                total: processedComics.length,
                processed: chunkProgress.processedItems,
                chunks: chunkProgress.totalChunks,
                currentChunk: chunkProgress.currentChunk,
                created: 0, // Will be updated from chunk results
                updated: 0,
                errors: 0,
                isComplete: false,
                startTime: chunkProgress.startTime,
                estimatedTimeRemaining: chunkProgress.estimatedTimeRemaining,
                rate: Math.round(
                  (chunkProgress.processedItems /
                    (Date.now() - chunkProgress.startTime)) *
                    1000
                ),
              };

              updateState({ progress });
            },
            onChunkComplete: (chunkResult) => {
              console.log(
                `✅ Chunk ${chunkResult.chunkIndex + 1} completed:`,
                chunkResult
              );

              // Update progress with cumulative results
              setState((prev) => {
                if (!prev.progress) return prev;

                const updatedProgress: ImportProgress = {
                  ...prev.progress,
                  currentChunk: chunkResult.chunkIndex + 1,
                  // These will be accumulated from all chunk results
                };

                return { ...prev, progress: updatedProgress };
              });
            },
            onError: (chunkError) => {
              console.error(
                `❌ Chunk ${chunkError.chunkIndex + 1} failed:`,
                chunkError.error
              );
            },
          }
        );

        // Finalize progress
        const finalProgress: ImportProgress = {
          ...initialProgress,
          processed: processingResult.totalProcessed,
          created: processingResult.totalCreated,
          updated: processingResult.totalUpdated,
          errors: processingResult.totalErrors,
          isComplete: true,
          rate: Math.round(
            (processingResult.totalProcessed /
              processingResult.processingTime) *
              1000
          ),
        };

        // Create final results
        const results: ImportResults = {
          processed: processingResult.totalProcessed,
          created: processingResult.totalCreated,
          updated: processingResult.totalUpdated,
          errors: processingResult.totalErrors,
          processingTime: processingResult.processingTime,
          processingErrors: processingResult.errors
            .map((e) => e.error.message)
            .slice(0, 10),
          validationWarnings,
        };

        const formattedStats = formatImportStats(results);
        console.log(`🎉 Import complete!`, formattedStats);

        // Set warnings if needed
        let warning: string | null = null;
        if (
          invalidRows.length > 0 ||
          results.errors > 0 ||
          validationWarnings.length > 0
        ) {
          const messages = [];
          if (invalidRows.length > 0) {
            messages.push(
              `${invalidRows.length} rows were skipped due to invalid data`
            );
          }
          if (results.errors > 0) {
            messages.push(`${results.errors} comics failed to import`);
          }
          if (validationWarnings.length > 0) {
            messages.push(`${validationWarnings.length} validation warnings`);
          }
          warning = `Import completed with issues: ${messages.join(", ")}.`;
        }

        updateState({
          isImporting: false,
          progress: finalProgress,
          results,
          warning,
        });

        // Call completion callback
        onImportComplete?.(results);

        return results;
      } catch (error: any) {
        console.error("❌ Import failed:", error);
        updateState({
          isImporting: false,
          error: `Import failed: ${error.message}`,
        });
        return null;
      }
    },
    [updateState, onImportComplete]
  );

  return {
    state,
    importCSV,
    resetState,

    // Computed properties for convenience
    isImporting: state.isImporting,
    progress: state.progress,
    results: state.results,
    error: state.error,
    warning: state.warning,

    // Progress helpers
    percentComplete: state.progress
      ? Math.round((state.progress.processed / state.progress.total) * 100)
      : 0,

    formattedStats: state.results ? formatImportStats(state.results) : null,
  };
};

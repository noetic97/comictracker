import { Comic } from "../types";
import { apiService } from "./apiService";

export interface ChunkProcessorOptions {
  chunkSize: number;
  delayBetweenChunks: number;
  onProgress?: (progress: ChunkProgress) => void;
  onChunkComplete?: (result: ChunkResult) => void;
  onError?: (error: ChunkError) => void;
}

export interface ChunkProgress {
  currentChunk: number;
  totalChunks: number;
  processedItems: number;
  totalItems: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
  startTime: number;
}

export interface ChunkResult {
  chunkIndex: number;
  processed: number;
  created: number;
  updated: number;
  errors: number;
  processingTime: number;
  processingErrors?: string[];
}

export interface ChunkError {
  chunkIndex: number;
  error: Error;
  chunk: any[];
}

export interface ProcessingResult {
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
  totalErrors: number;
  processingTime: number;
  chunks: ChunkResult[];
  errors: ChunkError[];
}

/**
 * Splits an array into smaller chunks
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }
  return chunks;
};

/**
 * Processes comics in chunks with progress tracking
 */
export const processComicsInChunks = async (
  comics: Omit<Comic, "id">[],
  options: ChunkProcessorOptions
): Promise<ProcessingResult> => {
  const chunks = chunkArray(comics, options.chunkSize);
  const results: ChunkResult[] = [];
  const errors: ChunkError[] = [];

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    // Calculate and report progress
    const progress: ChunkProgress = {
      currentChunk: i + 1,
      totalChunks: chunks.length,
      processedItems: totalProcessed,
      totalItems: comics.length,
      percentComplete: (totalProcessed / comics.length) * 100,
      estimatedTimeRemaining: calculateETA(
        totalProcessed,
        comics.length,
        startTime
      ),
      startTime,
    };

    options.onProgress?.(progress);

    try {
      const chunkStartTime = Date.now();
      const result = await processChunk(chunk, i);
      const processingTime = Date.now() - chunkStartTime;

      const chunkResult: ChunkResult = {
        ...result,
        chunkIndex: i,
        processingTime,
      };

      results.push(chunkResult);

      totalProcessed += result.processed;
      totalCreated += result.created;
      totalUpdated += result.updated;
      totalErrors += result.errors;

      options.onChunkComplete?.(chunkResult);

      // Delay between chunks if not the last chunk
      if (i < chunks.length - 1 && options.delayBetweenChunks > 0) {
        await sleep(options.delayBetweenChunks);
      }
    } catch (error) {
      const chunkError: ChunkError = {
        chunkIndex: i,
        error: error as Error,
        chunk,
      };

      errors.push(chunkError);
      totalErrors += chunk.length; // Assume all items in chunk failed
      totalProcessed += chunk.length;

      options.onError?.(chunkError);
    }
  }

  return {
    totalProcessed,
    totalCreated,
    totalUpdated,
    totalErrors,
    processingTime: Date.now() - startTime,
    chunks: results,
    errors,
  };
};

/**
 * Process a single chunk of comics
 */
const processChunk = async (chunk: Omit<Comic, "id">[], _index: number) => {
  if (chunk.length === 0) {
    return {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      processingErrors: [],
    };
  }

  return await apiService.comics.bulkCreate(chunk);
};

/**
 * Calculate estimated time remaining
 */
const calculateETA = (
  processed: number,
  total: number,
  startTime: number
): number => {
  if (processed === 0) return 0;

  const elapsed = Date.now() - startTime;
  const rate = processed / elapsed; // items per ms
  const remaining = total - processed;

  return remaining / rate;
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper function for simple chunk processing with default options
 */
export const processComicsInChunksWithDefaults = async (
  comics: Omit<Comic, "id">[],
  options: Partial<ChunkProcessorOptions> = {}
): Promise<ProcessingResult> => {
  const defaultOptions: ChunkProcessorOptions = {
    chunkSize: 1000,
    delayBetweenChunks: 500,
    ...options,
  };

  return processComicsInChunks(comics, defaultOptions);
};

/**
 * Processing Contract - Defines how bulk operations work across the system
 * Used by: utils/chunkProcessor, hooks/useCSVImport, components/ImportProgress
 */

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

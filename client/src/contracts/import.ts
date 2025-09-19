/**
 * Import Contract - Defines how import operations work
 * Used by: hooks/useCSVImport, components/ImportCSV, utils/csvParser
 */

export interface ImportOptions {
  chunkSize?: number;
  delayBetweenChunks?: number;
  validateComics?: boolean;
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

export interface ImportState {
  isImporting: boolean;
  progress: ImportProgress | null;
  results: ImportResults | null;
  error: string | null;
  warning: string | null;
}

import { Comic } from "../types";

// useComicActions
export interface ComicActionsState {
  isUpdating: boolean;
  updatingComics: Set<string>; // Comic IDs currently being updated
  errors: Map<string, string>; // Comic ID -> error message
  lastOperation: string | null;
}

export interface ComicActionsOptions {
  onComicUpdated?: (updatedComic: Comic) => void;
  onError?: (error: string, comic: Comic) => void;
  optimisticUpdates?: boolean;
}

// useCSVImport
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

export interface ImportState {
  isImporting: boolean;
  progress: ImportProgress | null;
  results: ImportResults | null;
  error: string | null;
  warning: string | null;
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

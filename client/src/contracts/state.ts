/**
 * State Management Contract - Defines how comic state changes work
 * Used by: utils/comicStateManager, hooks/useComicActions, components
 */
import { Comic } from "../types";

export interface StateChangeResult {
  success: boolean;
  comic?: Comic;
  error?: string;
  originalComic: Comic;
}

export interface StateChangeOptions {
  retryCount?: number;
  onProgress?: (status: string) => void;
}

export interface BulkStateChangeResult {
  results: StateChangeResult[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

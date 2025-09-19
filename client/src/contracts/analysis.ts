/**
 * Analysis Contract - Defines how comic analysis works
 * Used by: utils/comicAnalyzer, hooks/useComicAnalysis, components/AnalysisResults
 */

export interface AnalysisResult {
  totalInFile: number;
  totalInDatabase: number;
  missing: MissingComic[];
  duplicatesInFile: DuplicateComic[];
  invalidComics: InvalidComic[];
  typeMismatches: TypeMismatch[];
}

export interface MissingComic {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  type: string;
  currentValue: number;
  reason: string;
  fileIndex: number;
}

export interface DuplicateComic {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  type: string;
  count: number;
  fileIndices: number[];
}

export interface InvalidComic {
  index: number;
  data: any;
  reason: string;
  errors: string[];
}

export interface TypeMismatch {
  publisher: string;
  series: string;
  volume: string;
  issue: string;
  fileType: string;
  databaseTypes: string[];
}

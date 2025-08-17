import { useState, useCallback } from "react";
import { ComicAnalyzer, AnalysisResult } from "../utils/comicAnalyzer";

export interface AnalysisState {
  isAnalyzing: boolean;
  results: AnalysisResult | null;
  error: string | null;
}

export const useComicAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    results: null,
    error: null,
  });

  const updateState = useCallback((updates: Partial<AnalysisState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const analyzeComics = useCallback(
    async (fileComics: any[]) => {
      try {
        updateState({
          isAnalyzing: true,
          error: null,
        });

        console.log("🔍 Starting comic analysis...");

        const analyzer = new ComicAnalyzer();
        const results = await analyzer.analyzeComics(fileComics);

        const summary = analyzer.getSummary(results);
        console.log("🔍 Analysis complete:", summary);

        // Log sample results for debugging
        if (results.missing.length > 0) {
          console.log("📋 Sample missing comics:");
          results.missing.slice(0, 5).forEach((comic, index) => {
            console.log(
              `${index + 1}. ${comic.publisher} - ${comic.series} ${
                comic.volume
              } #${comic.issue} [${comic.type}] - ${comic.reason}`
            );
          });
        }

        if (results.typeMismatches.length > 0) {
          console.log("🔄 Sample type mismatches:");
          results.typeMismatches.slice(0, 3).forEach((mismatch, index) => {
            console.log(
              `${index + 1}. ${mismatch.publisher} - ${mismatch.series} #${
                mismatch.issue
              }: File="${
                mismatch.fileType
              }" vs DB="${mismatch.databaseTypes.join(", ")}"`
            );
          });
        }

        updateState({
          isAnalyzing: false,
          results,
        });

        return results;
      } catch (error: any) {
        console.error("Analysis failed:", error);
        updateState({
          isAnalyzing: false,
          error: `Analysis failed: ${error.message}`,
        });
        return null;
      }
    },
    [updateState]
  );

  const clearResults = useCallback(() => {
    setState({
      isAnalyzing: false,
      results: null,
      error: null,
    });
  }, []);

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    results: state.results,
    error: state.error,

    // Actions
    analyzeComics,
    clearResults,

    // Computed properties
    hasResults: !!state.results,
    summary: state.results
      ? {
          totalInFile: state.results.totalInFile,
          totalInDatabase: state.results.totalInDatabase,
          missingCount: state.results.missing.length,
          invalidCount: state.results.invalidComics.length,
          duplicateCount: state.results.duplicatesInFile.length,
          typeMismatchCount: state.results.typeMismatches.length,
        }
      : null,
  };
};

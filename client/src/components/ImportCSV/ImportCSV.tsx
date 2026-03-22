import React from "react";
import FileUploadSection from "./FileUploadSection";
import AnalysisSection from "./AnalysisSection";
import ImportProgressDisplay from "./ImportProgressDisplay";
import ImportResultsDisplay from "./ImportResultsDisplay";
import AnalysisResultsDisplay from "./AnalysisResultsDisplay";
import ErrorMessage from "../shared/ErrorMessage";
import { useCSVImport } from "../../hooks/useCSVImport";
import { useComicAnalysis } from "../../hooks/useComicAnalysis";
import { usePersistence } from "../../hooks/usePersistence";
import { Comic } from "../../types";
import { parseComicsCSV } from "../../utils/csv/csvParser";
import * as S from "./styles";

interface Props {
  onImport: (comics: Comic[]) => void;
  /** Runs after a successful CSV import (e.g. refresh offline IndexedDB copy). */
  afterSuccessfulImport?: () => void | Promise<void>;
}

const ImportCSV: React.FC<Props> = ({ onImport, afterSuccessfulImport }) => {
  // Custom hooks for modular functionality
  const csvImport = useCSVImport((results) => {
    console.log("Import completed, refreshing UI...", results);
    // Trigger parent refresh to get updated comics with real IDs from server
    onImport([]);
    void Promise.resolve(afterSuccessfulImport?.()).catch((err) => {
      console.error("afterSuccessfulImport failed:", err);
    });
  });

  const comicAnalysis = useComicAnalysis();

  const persistence = usePersistence("lastParsedComics", "lastUploadTimestamp");

  // Handle file selection and import
  const handleFileSelect = async (file: File) => {
    // Parse and persist for later analysis
    try {
      const { validComics, invalidRows } = await parseComicsCSV(file);

      const allParsedComics = [...validComics, ...invalidRows];
      persistence.persistData(allParsedComics);

      // Start import process
      await csvImport.importCSV(file, {
        chunkSize: 1000,
        delayBetweenChunks: 500,
        validateComics: true,
      });
    } catch (error) {
      console.error("File processing failed:", error);
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!persistence.data || persistence.data.length === 0) {
      return;
    }

    await comicAnalysis.analyzeComics(persistence.data);
  };

  // Clear all data
  const handleClearAll = () => {
    persistence.clearData();
    comicAnalysis.clearResults();
    csvImport.resetState();
  };

  return (
    <S.ImportContainer>
      {/* Upload Section */}
      <FileUploadSection
        onFileSelect={handleFileSelect}
        isImporting={csvImport.isImporting}
      />

      {/* Analysis Section */}
      <AnalysisSection
        persistedData={persistence.data}
        persistedTimestamp={persistence.timestamp}
        isImporting={csvImport.isImporting}
        isAnalyzing={comicAnalysis.isAnalyzing}
        onAnalyze={handleAnalyze}
        onClear={handleClearAll}
      />

      {/* Import Progress */}
      {csvImport.progress && (
        <ImportProgressDisplay
          progress={csvImport.progress}
          percentComplete={csvImport.percentComplete}
        />
      )}

      {/* Import Results */}
      {csvImport.results && (
        <ImportResultsDisplay
          results={csvImport.results}
          isComplete={csvImport.progress?.isComplete || false}
          onReset={csvImport.resetState}
        />
      )}

      {/* Analysis Results */}
      {comicAnalysis.results && (
        <AnalysisResultsDisplay results={comicAnalysis.results} />
      )}

      {/* Error Messages */}
      {csvImport.error && (
        <ErrorMessage
          message={csvImport.error}
          type="error"
          onDismiss={csvImport.resetState}
        />
      )}

      {csvImport.warning && (
        <ErrorMessage
          message={csvImport.warning}
          type="warning"
          onDismiss={() => {
            /* Keep warning visible */
          }}
        />
      )}

      {comicAnalysis.error && (
        <ErrorMessage
          message={comicAnalysis.error}
          type="error"
          onDismiss={comicAnalysis.clearResults}
        />
      )}
    </S.ImportContainer>
  );
};

export default ImportCSV;

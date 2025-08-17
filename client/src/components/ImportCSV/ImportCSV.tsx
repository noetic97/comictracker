import React from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Search,
} from "lucide-react";
import FileUploadButton from "../shared/FileUploadButton";
import ErrorMessage from "../shared/ErrorMessage";
import Button from "../shared/Button";
import { useCSVImport } from "../../hooks/useCSVImport";
import { useComicAnalysis } from "../../hooks/useComicAnalysis";
import { usePersistence } from "../../hooks/usePersistence";
import {
  formatDuration,
  formatNumber,
  createProgressMessage,
} from "../../utils/formatters";
import {
  generateMissingComicsReport,
  downloadReport,
  generateReportFilename,
} from "../../utils/reportGenerator";
import { Comic } from "../../types";
import * as S from "./styles";

interface Props {
  onImport: (comics: Comic[]) => void;
}

const ImportCSV: React.FC<Props> = ({ onImport }) => {
  // Custom hooks for modular functionality
  const csvImport = useCSVImport(() => {
    console.log("Import completed, refreshing UI...");
    onImport([]); // Trigger parent refresh
  });

  const comicAnalysis = useComicAnalysis();

  const persistence = usePersistence("lastParsedComics", "lastUploadTimestamp");

  // Handle file selection and import
  const handleFileSelect = async (file: File) => {
    // Parse and persist for later analysis
    try {
      const { validComics, invalidRows } = await import(
        "../../utils/csvParser"
      ).then((module) => module.parseComicsCSV(file));

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

  // Handle report download
  const handleDownloadReport = () => {
    if (!comicAnalysis.results) return;

    const report = generateMissingComicsReport(comicAnalysis.results, {
      maxMissingItems: 100,
      maxInvalidItems: 50,
      maxDuplicateItems: 50,
      includeDebuggingNotes: true,
    });

    const filename = generateReportFilename("missing-comics-analysis");
    downloadReport(report, filename);
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
      {!csvImport.isImporting && (
        <S.UploadSection>
          <FileUploadButton onFileSelect={handleFileSelect} accept=".csv">
            Upload CSV
          </FileUploadButton>
        </S.UploadSection>
      )}

      {/* Analysis Section - Show if we have persisted data */}
      {persistence.data &&
        persistence.data.length > 0 &&
        !csvImport.isImporting && (
          <S.AnalysisSection>
            <S.AnalysisTitle>
              <Search size={20} />
              Find Missing Comics
            </S.AnalysisTitle>
            <S.AnalysisDescription>
              Analyze which comics from your upload on {persistence.timestamp}{" "}
              are missing from the database. File contained{" "}
              {formatNumber(persistence.data.length)} total records.
            </S.AnalysisDescription>
            <S.AnalysisButtonGroup>
              <Button
                onClick={handleAnalyze}
                icon={Search}
                disabled={comicAnalysis.isAnalyzing}
                variant="secondary"
              >
                {comicAnalysis.isAnalyzing
                  ? "Analyzing..."
                  : "Analyze Missing Comics"}
              </Button>
              <Button
                onClick={handleClearAll}
                icon={X}
                variant="tertiary"
                size="small"
              >
                Clear
              </Button>
            </S.AnalysisButtonGroup>
          </S.AnalysisSection>
        )}

      {/* Import Progress */}
      {csvImport.progress && (
        <S.ProgressContainer>
          <S.ProgressHeader>
            <S.ProgressTitle>
              <Upload size={20} />
              Importing Comics...
            </S.ProgressTitle>
            <S.ProgressStats>
              Chunk {csvImport.progress.currentChunk} of{" "}
              {csvImport.progress.chunks}
            </S.ProgressStats>
          </S.ProgressHeader>

          <S.ProgressBarContainer>
            <S.ProgressBar style={{ width: `${csvImport.percentComplete}%` }} />
            <S.ProgressText>
              {createProgressMessage(
                csvImport.progress.processed,
                csvImport.progress.total,
                "comics"
              )}
            </S.ProgressText>
          </S.ProgressBarContainer>

          <S.ProgressDetails>
            <S.ProgressDetailItem>
              <CheckCircle size={16} />
              <span>{formatNumber(csvImport.progress.created)} created</span>
            </S.ProgressDetailItem>
            <S.ProgressDetailItem>
              <CheckCircle size={16} />
              <span>{formatNumber(csvImport.progress.updated)} updated</span>
            </S.ProgressDetailItem>
            {csvImport.progress.errors > 0 && (
              <S.ProgressDetailItem>
                <AlertCircle size={16} />
                <span>{formatNumber(csvImport.progress.errors)} errors</span>
              </S.ProgressDetailItem>
            )}
          </S.ProgressDetails>

          <S.ProgressMeta>
            <span>
              Rate: {formatNumber(csvImport.progress.rate)} comics/sec
            </span>
            <span>
              ETA: {formatDuration(csvImport.progress.estimatedTimeRemaining)}
            </span>
            <span>
              Elapsed:{" "}
              {formatDuration(Date.now() - csvImport.progress.startTime)}
            </span>
          </S.ProgressMeta>
        </S.ProgressContainer>
      )}

      {/* Import Results */}
      {csvImport.results && csvImport.progress?.isComplete && (
        <S.ResultsContainer>
          <S.ResultsHeader>
            <CheckCircle size={24} />
            <S.ResultsTitle>Import Complete!</S.ResultsTitle>
            <S.ResetButton onClick={csvImport.resetState}>
              <X size={16} />
            </S.ResetButton>
          </S.ResultsHeader>

          <S.ResultsGrid>
            <S.ResultsStat>
              <S.ResultsNumber>
                {formatNumber(csvImport.results.processed)}
              </S.ResultsNumber>
              <S.ResultsLabel>Processed</S.ResultsLabel>
            </S.ResultsStat>
            <S.ResultsStat>
              <S.ResultsNumber success>
                {formatNumber(csvImport.results.created)}
              </S.ResultsNumber>
              <S.ResultsLabel>Created</S.ResultsLabel>
            </S.ResultsStat>
            <S.ResultsStat>
              <S.ResultsNumber>
                {formatNumber(csvImport.results.updated)}
              </S.ResultsNumber>
              <S.ResultsLabel>Updated</S.ResultsLabel>
            </S.ResultsStat>
            {csvImport.results.errors > 0 && (
              <S.ResultsStat>
                <S.ResultsNumber error>
                  {formatNumber(csvImport.results.errors)}
                </S.ResultsNumber>
                <S.ResultsLabel>Errors</S.ResultsLabel>
              </S.ResultsStat>
            )}
          </S.ResultsGrid>

          <S.ResultsMeta>
            Total time: {formatDuration(csvImport.results.processingTime)}
          </S.ResultsMeta>

          {csvImport.results.processingErrors &&
            csvImport.results.processingErrors.length > 0 && (
              <S.ErrorsList>
                <S.ErrorsTitle>
                  Processing Errors (showing first 10):
                </S.ErrorsTitle>
                {csvImport.results.processingErrors.map((error, index) => (
                  <S.ErrorItem key={index}>{error}</S.ErrorItem>
                ))}
              </S.ErrorsList>
            )}
        </S.ResultsContainer>
      )}

      {/* Analysis Results */}
      {comicAnalysis.results && (
        <S.AnalysisResults>
          <S.AnalysisResultsHeader>
            <S.AnalysisResultsTitle>
              <Search size={20} />
              Missing Comics Analysis
            </S.AnalysisResultsTitle>
            <Button
              onClick={handleDownloadReport}
              icon={Download}
              size="small"
              variant="tertiary"
            >
              Download Report
            </Button>
          </S.AnalysisResultsHeader>

          <S.AnalysisStatsGrid>
            <S.AnalysisStat>
              <S.AnalysisNumber>
                {formatNumber(comicAnalysis.results.totalInFile)}
              </S.AnalysisNumber>
              <S.AnalysisLabel>In File</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber>
                {formatNumber(comicAnalysis.results.totalInDatabase)}
              </S.AnalysisNumber>
              <S.AnalysisLabel>In Database</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber error>
                {formatNumber(comicAnalysis.results.missing.length)}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Missing</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber warning>
                {formatNumber(comicAnalysis.results.invalidComics.length)}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Invalid</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber warning>
                {formatNumber(comicAnalysis.results.duplicatesInFile.length)}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Duplicates</S.AnalysisLabel>
            </S.AnalysisStat>
          </S.AnalysisStatsGrid>

          {comicAnalysis.results.missing.length > 0 && (
            <S.MissingComicsList>
              <S.MissingComicsTitle>
                Missing Comics (showing first 20):
              </S.MissingComicsTitle>
              {comicAnalysis.results.missing
                .slice(0, 20)
                .map((comic, index) => (
                  <S.MissingComicItem key={index}>
                    <strong>{comic.publisher}</strong> - {comic.series}
                    {comic.volume && ` (${comic.volume})`} #{comic.issue}
                    {comic.type && ` [${comic.type}]`} - {comic.reason}
                  </S.MissingComicItem>
                ))}
              {comicAnalysis.results.missing.length > 20 && (
                <S.MissingComicItem>
                  ... and {comicAnalysis.results.missing.length - 20} more
                  (download full report)
                </S.MissingComicItem>
              )}
            </S.MissingComicsList>
          )}

          {comicAnalysis.results.typeMismatches.length > 0 && (
            <S.MissingComicsList>
              <S.MissingComicsTitle>
                Type Mismatches (showing first 10):
              </S.MissingComicsTitle>
              {comicAnalysis.results.typeMismatches
                .slice(0, 10)
                .map((mismatch, index) => (
                  <S.MissingComicItem key={index}>
                    <strong>{mismatch.publisher}</strong> - {mismatch.series}
                    {mismatch.volume && ` (${mismatch.volume})`} #
                    {mismatch.issue} - File has "{mismatch.fileType}" but
                    database has: {mismatch.databaseTypes.join(", ")}
                  </S.MissingComicItem>
                ))}
            </S.MissingComicsList>
          )}
        </S.AnalysisResults>
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

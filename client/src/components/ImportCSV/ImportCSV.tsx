import React, { useState, useEffect } from "react";
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
import { parseComicsCSV } from "../../utils/csvParser";
import { Comic } from "../../types";
import { apiService } from "../../utils/apiService";
import * as S from "./styles";

interface Props {
  onImport: (comics: Comic[]) => void;
}

interface ImportProgress {
  total: number;
  processed: number;
  chunks: number;
  currentChunk: number;
  created: number;
  updated: number;
  errors: number;
  isComplete: boolean;
  startTime: number;
}

interface ChunkResult {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  processingErrors?: string[];
}

interface MissingComicAnalysis {
  totalInFile: number;
  totalInDatabase: number;
  missing: Array<{
    publisher: string;
    series: string;
    volume: string;
    issue: string;
    currentValue: number;
    reason: string;
  }>;
  duplicatesInFile: Array<{
    publisher: string;
    series: string;
    volume: string;
    issue: string;
    count: number;
  }>;
  invalidComics: Array<{
    index: number;
    data: any;
    reason: string;
  }>;
}

const CHUNK_SIZE = 1000;
const LAST_PARSED_COMICS_KEY = "lastParsedComics";
const LAST_UPLOAD_TIMESTAMP_KEY = "lastUploadTimestamp";

const ImportCSV: React.FC<Props> = ({ onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [results, setResults] = useState<ChunkResult | null>(null);
  const [missingAnalysis, setMissingAnalysis] =
    useState<MissingComicAnalysis | null>(null);
  const [lastParsedComics, setLastParsedComics] = useState<any[]>([]);
  const [lastUploadTime, setLastUploadTime] = useState<string | null>(null);

  // Load persisted data on component mount
  useEffect(() => {
    try {
      const savedComics = localStorage.getItem(LAST_PARSED_COMICS_KEY);
      const savedTimestamp = localStorage.getItem(LAST_UPLOAD_TIMESTAMP_KEY);

      if (savedComics && savedTimestamp) {
        const parsedComics = JSON.parse(savedComics);
        const timestamp = new Date(savedTimestamp);

        // Only keep data if it's from the last 24 hours
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        if (timestamp > dayAgo && parsedComics.length > 0) {
          setLastParsedComics(parsedComics);
          setLastUploadTime(timestamp.toLocaleString());
          console.log(
            `📁 Restored ${
              parsedComics.length
            } comics from previous upload at ${timestamp.toLocaleString()}`
          );
        } else {
          localStorage.removeItem(LAST_PARSED_COMICS_KEY);
          localStorage.removeItem(LAST_UPLOAD_TIMESTAMP_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to restore previous upload data:", error);
      localStorage.removeItem(LAST_PARSED_COMICS_KEY);
      localStorage.removeItem(LAST_UPLOAD_TIMESTAMP_KEY);
    }
  }, []);

  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      const chunk = array.slice(i, i + size);
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
    }
    return chunks;
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const persistParsedComics = (comics: any[]) => {
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(LAST_PARSED_COMICS_KEY, JSON.stringify(comics));
      localStorage.setItem(LAST_UPLOAD_TIMESTAMP_KEY, timestamp);
      setLastParsedComics(comics);
      setLastUploadTime(new Date(timestamp).toLocaleString());
    } catch (error) {
      console.error("Failed to persist parsed comics:", error);
    }
  };

  const clearPersistedData = () => {
    localStorage.removeItem(LAST_PARSED_COMICS_KEY);
    localStorage.removeItem(LAST_UPLOAD_TIMESTAMP_KEY);
    setLastParsedComics([]);
    setLastUploadTime(null);
    setMissingAnalysis(null);
  };

  const analyzeComicsComparison = async (parsedComics: any[]) => {
    try {
      setIsAnalyzing(true);
      console.log("🔍 Analyzing differences between file and database...");

      const { comics: dbComics } = await apiService.comics.getAll();

      // Updated unique key to include type field
      const dbLookup = new Map<string, Comic>();
      dbComics.forEach((comic) => {
        const key =
          `${comic.publisher}|${comic.series}|${comic.volume}|${comic.issue}|${comic.type}`.toLowerCase();
        dbLookup.set(key, comic);
      });

      const fileLookup = new Map<string, any>();
      const duplicatesInFile: Map<string, number> = new Map();

      parsedComics.forEach((comic, index) => {
        // Include type in the unique key
        const key = `${comic.publisher}|${comic.series}|${comic.volume || ""}|${
          comic.issue
        }|${comic.type || ""}`.toLowerCase();

        const currentCount = duplicatesInFile.get(key) || 0;
        duplicatesInFile.set(key, currentCount + 1);

        if (!fileLookup.has(key)) {
          fileLookup.set(key, { ...comic, fileIndex: index });
        }
      });

      const missing: MissingComicAnalysis["missing"] = [];
      const invalidComics: MissingComicAnalysis["invalidComics"] = [];

      parsedComics.forEach((comic, index) => {
        // More lenient validation - don't require numeric issue numbers
        const missingFields = [];
        if (!comic.publisher || comic.publisher.trim() === "")
          missingFields.push("publisher");
        if (!comic.series || comic.series.trim() === "")
          missingFields.push("series");
        if (!comic.issue || comic.issue.trim() === "")
          missingFields.push("issue");

        if (missingFields.length > 0) {
          invalidComics.push({
            index: index + 1,
            data: {
              publisher: comic.publisher || "[EMPTY]",
              series: comic.series || "[EMPTY]",
              volume: comic.volume || "[EMPTY]",
              issue: comic.issue || "[EMPTY]",
              type: comic.type || "[EMPTY]",
              "Current Value": comic["Current Value"] || "[EMPTY]",
            },
            reason: `Missing required fields: ${missingFields.join(", ")}`,
          });
          return;
        }

        // Include type in the lookup key
        const key = `${comic.publisher}|${comic.series}|${comic.volume || ""}|${
          comic.issue
        }|${comic.type || ""}`.toLowerCase();

        if (!dbLookup.has(key)) {
          // Check if it might be a type mismatch by looking without type
          const keyWithoutType = `${comic.publisher}|${comic.series}|${
            comic.volume || ""
          }|${comic.issue}`.toLowerCase();
          const similarComics = Array.from(dbLookup.entries()).filter(
            ([dbKey]) => dbKey.startsWith(keyWithoutType + "|")
          );

          let reason = "Not found in database";
          if (similarComics.length > 0) {
            const existingTypes = similarComics.map(([dbKey]) => {
              const parts = dbKey.split("|");
              return parts[4] || "[no type]";
            });
            reason = `Type mismatch - exists as: ${existingTypes.join(
              ", "
            )} but file has: ${comic.type || "[no type]"}`;
          }

          missing.push({
            publisher: comic.publisher,
            series: comic.series,
            volume: comic.volume || "",
            issue: comic.issue,
            currentValue: parseFloat(comic["Current Value"]) || 0,
            reason,
          });
        }
      });

      const duplicatesInFileArray = Array.from(duplicatesInFile.entries())
        .filter(([_, count]) => count > 1)
        .map(([key, count]) => {
          const [publisher, series, volume, issue, type] = key.split("|");
          return {
            publisher,
            series,
            volume,
            issue: `${issue} (${type})`,
            count,
          };
        });

      const analysis: MissingComicAnalysis = {
        totalInFile: parsedComics.length,
        totalInDatabase: dbComics.length,
        missing,
        duplicatesInFile: duplicatesInFileArray,
        invalidComics,
      };

      setMissingAnalysis(analysis);

      console.log("🔍 Analysis complete:", {
        totalInFile: analysis.totalInFile,
        totalInDatabase: analysis.totalInDatabase,
        missing: analysis.missing.length,
        duplicatesInFile: analysis.duplicatesInFile.length,
        invalidComics: analysis.invalidComics.length,
      });

      // Log some sample missing comics for debugging
      if (analysis.missing.length > 0) {
        console.log("📋 Sample missing comics:");
        analysis.missing.slice(0, 5).forEach((comic, index) => {
          console.log(
            `${index + 1}. ${comic.publisher} - ${comic.series} ${
              comic.volume
            } #${comic.issue} - ${comic.reason}`
          );
        });
      }

      // Log some sample invalid comics for debugging
      if (analysis.invalidComics.length > 0) {
        console.log("❌ Sample invalid comics:");
        analysis.invalidComics.slice(0, 5).forEach((comic, index) => {
          console.log(
            `${index + 1}. Row ${comic.index}: ${comic.reason}`,
            comic.data
          );
        });
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadMissingComicsReport = () => {
    if (!missingAnalysis) return;

    const report = [
      "MISSING COMICS ANALYSIS REPORT",
      "=".repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      `File comics: ${missingAnalysis.totalInFile}`,
      `Database comics: ${missingAnalysis.totalInDatabase}`,
      `Missing comics: ${missingAnalysis.missing.length}`,
      `Invalid comics: ${missingAnalysis.invalidComics.length}`,
      `Duplicates in file: ${missingAnalysis.duplicatesInFile.length}`,
      "",
      "MISSING COMICS:",
      "-".repeat(50),
      "Publisher | Series | Volume | Issue | Type | Value | Reason",
      "-".repeat(50),
      ...missingAnalysis.missing.map(
        (comic) =>
          `${comic.publisher} | ${comic.series} | ${comic.volume} | #${comic.issue} | [TYPE FIELD MISSING] | ${comic.currentValue} | ${comic.reason}`
      ),
      "",
      "INVALID COMICS:",
      "-".repeat(50),
      "Row | Reason | Data",
      "-".repeat(30),
      ...missingAnalysis.invalidComics.map(
        (comic) =>
          `Row ${comic.index}: ${comic.reason} | ${JSON.stringify(
            comic.data,
            null,
            2
          )}`
      ),
      "",
      "DUPLICATES IN FILE:",
      "-".repeat(50),
      "Publisher | Series | Volume | Issue | Count",
      "-".repeat(40),
      ...missingAnalysis.duplicatesInFile.map(
        (comic) =>
          `${comic.publisher} | ${comic.series} | ${comic.volume} | #${comic.issue} | Count: ${comic.count}`
      ),
      "",
      "DEBUGGING NOTES:",
      "-".repeat(30),
      "1. Issue numbers like 'FCBD', 'Ashcan #1' are now handled properly",
      "2. Type field (Issue/Annual/Giant Size) is now included in uniqueness check",
      "3. Missing comics may be due to type mismatches or special formatting",
      "4. Check the console logs for additional debugging information",
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missing-comics-analysis-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setWarning(null);
      setResults(null);
      setMissingAnalysis(null);
      setIsImporting(true);

      console.log("📁 Parsing CSV file...");
      const { validComics, invalidRows } = await parseComicsCSV(file);

      const allParsedComics = [...validComics, ...invalidRows];
      persistParsedComics(allParsedComics);

      if (validComics.length === 0) {
        setError(
          "No valid comic data found in the CSV file. Please check the file format and try again."
        );
        setIsImporting(false);
        return;
      }

      console.log(
        `✅ Parsed ${validComics.length} valid comics, ${invalidRows.length} invalid rows`
      );

      const chunks = chunkArray(validComics, CHUNK_SIZE);
      console.log(
        `📦 Split into ${chunks.length} chunks of max ${CHUNK_SIZE} comics each`
      );

      chunks.forEach((chunk, index) => {
        console.log(`📦 Chunk ${index + 1}: ${chunk.length} comics`);
      });

      const nonEmptyChunks = chunks.filter((chunk) => chunk.length > 0);
      if (nonEmptyChunks.length !== chunks.length) {
        console.warn(
          `⚠️ Filtered out ${
            chunks.length - nonEmptyChunks.length
          } empty chunks`
        );
      }

      const initialProgress: ImportProgress = {
        total: validComics.length,
        processed: 0,
        chunks: nonEmptyChunks.length,
        currentChunk: 0,
        created: 0,
        updated: 0,
        errors: 0,
        isComplete: false,
        startTime: Date.now(),
      };
      setProgress(initialProgress);

      let totalCreated = 0;
      let totalUpdated = 0;
      let totalErrors = 0;
      let totalProcessed = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < nonEmptyChunks.length; i++) {
        const chunk = nonEmptyChunks[i];

        console.log(
          `🚀 Processing chunk ${i + 1}/${nonEmptyChunks.length} (${
            chunk.length
          } comics)`
        );

        setProgress((prev) =>
          prev
            ? {
                ...prev,
                currentChunk: i + 1,
                chunks: nonEmptyChunks.length,
              }
            : null
        );

        try {
          const startTime = Date.now();

          if (chunk.length === 0) {
            console.log(`⚠️ Skipping empty chunk ${i + 1}`);
            continue;
          }

          const result = await apiService.comics.bulkCreate(chunk);
          const endTime = Date.now();

          console.log(
            `✅ Chunk ${i + 1} completed in ${endTime - startTime}ms:`,
            result
          );

          totalCreated += result.created || 0;
          totalUpdated += result.updated || 0;
          totalErrors += result.errors || 0;
          totalProcessed += result.processed || chunk.length;

          if (result.processingErrors) {
            allErrors.push(...result.processingErrors);
          }

          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  processed: totalProcessed,
                  created: totalCreated,
                  updated: totalUpdated,
                  errors: totalErrors,
                }
              : null
          );

          if (i < nonEmptyChunks.length - 1) {
            await sleep(500);
          }
        } catch (chunkError: any) {
          console.error(`❌ Chunk ${i + 1} failed:`, chunkError);

          const errorMessage = chunkError.message || `Chunk ${i + 1} failed`;
          allErrors.push(errorMessage);

          const estimatedFailedComics = chunk.length;
          totalErrors += estimatedFailedComics;
          totalProcessed += estimatedFailedComics;

          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  processed: totalProcessed,
                  errors: totalErrors,
                }
              : null
          );

          console.log(`⚠️ Continuing with next chunk despite error...`);
        }
      }

      const finalTime = Date.now();
      setProgress((prev) =>
        prev
          ? {
              ...prev,
              isComplete: true,
            }
          : null
      );

      const finalResults: ChunkResult = {
        processed: totalProcessed,
        created: totalCreated,
        updated: totalUpdated,
        errors: totalErrors,
        processingErrors: allErrors.slice(0, 10),
      };
      setResults(finalResults);

      console.log(`🎉 Import complete!`, finalResults);
      console.log(
        `⏱️ Total time: ${(finalTime - initialProgress.startTime) / 1000}s`
      );

      onImport([]);

      if (invalidRows.length > 0 || totalErrors > 0) {
        const messages = [];
        if (invalidRows.length > 0) {
          messages.push(
            `${invalidRows.length} rows were skipped due to invalid data`
          );
        }
        if (totalErrors > 0) {
          messages.push(`${totalErrors} comics failed to import`);
        }
        setWarning(
          `Import completed with issues: ${messages.join(
            ", "
          )}. Use the analysis tool below to investigate.`
        );
      }
    } catch (parseError: any) {
      console.error("❌ CSV parsing error:", parseError);
      setError(
        "Failed to parse CSV file. Please check the file format and try again."
      );
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setProgress(null);
    setResults(null);
    setError(null);
    setWarning(null);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const calculateETA = (progress: ImportProgress): string => {
    if (progress.processed === 0) return "Calculating...";

    const elapsed = Date.now() - progress.startTime;
    const rate = progress.processed / elapsed;
    const remaining = progress.total - progress.processed;
    const eta = remaining / rate;

    return formatDuration(eta);
  };

  const calculateRate = (progress: ImportProgress): number => {
    const elapsed = Date.now() - progress.startTime;
    return Math.round((progress.processed / elapsed) * 1000);
  };

  return (
    <S.ImportContainer>
      {!isImporting && (
        <S.UploadSection>
          <FileUploadButton onFileSelect={handleFileSelect} accept=".csv">
            Upload CSV
          </FileUploadButton>
        </S.UploadSection>
      )}

      {lastParsedComics.length > 0 && !isImporting && (
        <S.AnalysisSection>
          <S.AnalysisTitle>
            <Search size={20} />
            Find Missing Comics
          </S.AnalysisTitle>
          <S.AnalysisDescription>
            Analyze which comics from your upload on {lastUploadTime} are
            missing from the database. File contained{" "}
            {lastParsedComics.length.toLocaleString()} total records.
          </S.AnalysisDescription>
          <S.AnalysisButtonGroup>
            <Button
              onClick={() => analyzeComicsComparison(lastParsedComics)}
              icon={Search}
              disabled={isAnalyzing}
              variant="secondary"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Missing Comics"}
            </Button>
            <Button
              onClick={clearPersistedData}
              icon={X}
              variant="tertiary"
              size="small"
            >
              Clear
            </Button>
          </S.AnalysisButtonGroup>
        </S.AnalysisSection>
      )}

      {isImporting && progress && (
        <S.ProgressContainer>
          <S.ProgressHeader>
            <S.ProgressTitle>
              <Upload size={20} />
              Importing Comics...
            </S.ProgressTitle>
            <S.ProgressStats>
              Chunk {progress.currentChunk} of {progress.chunks}
            </S.ProgressStats>
          </S.ProgressHeader>

          <S.ProgressBarContainer>
            <S.ProgressBar
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, (progress.processed / progress.total) * 100)
                )}%`,
              }}
            />
            <S.ProgressText>
              {progress.processed.toLocaleString()} /{" "}
              {progress.total.toLocaleString()} comics (
              {Math.round((progress.processed / progress.total) * 100)}%)
            </S.ProgressText>
          </S.ProgressBarContainer>

          <S.ProgressDetails>
            <S.ProgressDetailItem>
              <CheckCircle size={16} />
              <span>{progress.created.toLocaleString()} created</span>
            </S.ProgressDetailItem>
            <S.ProgressDetailItem>
              <CheckCircle size={16} />
              <span>{progress.updated.toLocaleString()} updated</span>
            </S.ProgressDetailItem>
            {progress.errors > 0 && (
              <S.ProgressDetailItem>
                <AlertCircle size={16} />
                <span>{progress.errors.toLocaleString()} errors</span>
              </S.ProgressDetailItem>
            )}
          </S.ProgressDetails>

          <S.ProgressMeta>
            <span>Rate: {calculateRate(progress)} comics/sec</span>
            <span>ETA: {calculateETA(progress)}</span>
            <span>
              Elapsed: {formatDuration(Date.now() - progress.startTime)}
            </span>
          </S.ProgressMeta>
        </S.ProgressContainer>
      )}

      {results && progress?.isComplete && (
        <S.ResultsContainer>
          <S.ResultsHeader>
            <CheckCircle size={24} />
            <S.ResultsTitle>Import Complete!</S.ResultsTitle>
            <S.ResetButton onClick={resetImport}>
              <X size={16} />
            </S.ResetButton>
          </S.ResultsHeader>

          <S.ResultsGrid>
            <S.ResultsStat>
              <S.ResultsNumber>
                {results.processed.toLocaleString()}
              </S.ResultsNumber>
              <S.ResultsLabel>Processed</S.ResultsLabel>
            </S.ResultsStat>
            <S.ResultsStat>
              <S.ResultsNumber success>
                {results.created.toLocaleString()}
              </S.ResultsNumber>
              <S.ResultsLabel>Created</S.ResultsLabel>
            </S.ResultsStat>
            <S.ResultsStat>
              <S.ResultsNumber>
                {results.updated.toLocaleString()}
              </S.ResultsNumber>
              <S.ResultsLabel>Updated</S.ResultsLabel>
            </S.ResultsStat>
            {results.errors > 0 && (
              <S.ResultsStat>
                <S.ResultsNumber error>
                  {results.errors.toLocaleString()}
                </S.ResultsNumber>
                <S.ResultsLabel>Errors</S.ResultsLabel>
              </S.ResultsStat>
            )}
          </S.ResultsGrid>

          <S.ResultsMeta>
            Total time:{" "}
            {formatDuration(Date.now() - (progress?.startTime || 0))}
          </S.ResultsMeta>

          {results.processingErrors && results.processingErrors.length > 0 && (
            <S.ErrorsList>
              <S.ErrorsTitle>
                Processing Errors (showing first 10):
              </S.ErrorsTitle>
              {results.processingErrors.map((error, index) => (
                <S.ErrorItem key={index}>{error}</S.ErrorItem>
              ))}
            </S.ErrorsList>
          )}
        </S.ResultsContainer>
      )}

      {missingAnalysis && (
        <S.AnalysisResults>
          <S.AnalysisResultsHeader>
            <S.AnalysisResultsTitle>
              <Search size={20} />
              Missing Comics Analysis
            </S.AnalysisResultsTitle>
            <Button
              onClick={downloadMissingComicsReport}
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
                {missingAnalysis.totalInFile.toLocaleString()}
              </S.AnalysisNumber>
              <S.AnalysisLabel>In File</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber>
                {missingAnalysis.totalInDatabase.toLocaleString()}
              </S.AnalysisNumber>
              <S.AnalysisLabel>In Database</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber error>
                {missingAnalysis.missing.length.toLocaleString()}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Missing</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber warning>
                {missingAnalysis.invalidComics.length.toLocaleString()}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Invalid</S.AnalysisLabel>
            </S.AnalysisStat>
            <S.AnalysisStat>
              <S.AnalysisNumber warning>
                {missingAnalysis.duplicatesInFile.length.toLocaleString()}
              </S.AnalysisNumber>
              <S.AnalysisLabel>Duplicates</S.AnalysisLabel>
            </S.AnalysisStat>
          </S.AnalysisStatsGrid>

          {missingAnalysis.missing.length > 0 && (
            <S.MissingComicsList>
              <S.MissingComicsTitle>
                Missing Comics (showing first 20):
              </S.MissingComicsTitle>
              {missingAnalysis.missing.slice(0, 20).map((comic, index) => (
                <S.MissingComicItem key={index}>
                  <strong>{comic.publisher}</strong> - {comic.series}
                  {comic.volume && ` (${comic.volume})`} #{comic.issue} - $
                  {comic.reason}
                </S.MissingComicItem>
              ))}
              {missingAnalysis.missing.length > 20 && (
                <S.MissingComicItem>
                  ... and {missingAnalysis.missing.length - 20} more (download
                  full report)
                </S.MissingComicItem>
              )}
            </S.MissingComicsList>
          )}
        </S.AnalysisResults>
      )}

      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

      {warning && (
        <ErrorMessage
          message={warning}
          type="warning"
          onDismiss={() => setWarning(null)}
        />
      )}
    </S.ImportContainer>
  );
};

export default ImportCSV;

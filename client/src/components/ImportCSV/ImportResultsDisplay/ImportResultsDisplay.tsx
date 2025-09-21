import React from "react";
import { CheckCircle, X, FileText, BarChart } from "lucide-react";
import { formatDuration, formatNumber } from "../../../utils/formatters";
import {
  generateImportSummaryReport,
  downloadReport,
  generateReportFilename,
} from "../../../utils/reportGenerator";
import { ImportResults } from "../../../hooks/types";
import * as S from "./styles";

interface ImportResultsDisplayProps {
  results: ImportResults;
  isComplete: boolean;
  onReset: () => void;
}

const ImportResultsDisplay: React.FC<ImportResultsDisplayProps> = ({
  results,
  isComplete,
  onReset,
}) => {
  if (!results || !isComplete) {
    return null;
  }

  // NEW: Handle import summary download
  const handleDownloadSummary = () => {
    const report = generateImportSummaryReport({
      processed: results.processed,
      created: results.created,
      updated: results.updated,
      errors: results.errors,
      processingTime: results.processingTime,
    });

    const filename = generateReportFilename("import-summary");
    downloadReport(report, filename);
  };

  // Calculate some additional metrics for display
  const successRate =
    results.processed > 0
      ? (
          ((results.processed - results.errors) / results.processed) *
          100
        ).toFixed(1)
      : "0";

  const rate =
    results.processingTime > 0
      ? Math.round((results.processed / results.processingTime) * 1000)
      : 0;

  return (
    <S.ResultsContainer>
      <S.ResultsHeader>
        <CheckCircle size={24} />
        <S.ResultsTitle>Import Complete!</S.ResultsTitle>
        <S.ResetButton onClick={onReset}>
          <X size={16} />
        </S.ResetButton>
      </S.ResultsHeader>

      <S.ResultsGrid>
        <S.ResultsStat>
          <S.ResultsNumber>{formatNumber(results.processed)}</S.ResultsNumber>
          <S.ResultsLabel>Processed</S.ResultsLabel>
        </S.ResultsStat>
        <S.ResultsStat>
          <S.ResultsNumber success>
            {formatNumber(results.created)}
          </S.ResultsNumber>
          <S.ResultsLabel>Created</S.ResultsLabel>
        </S.ResultsStat>
        <S.ResultsStat>
          <S.ResultsNumber>{formatNumber(results.updated)}</S.ResultsNumber>
          <S.ResultsLabel>Updated</S.ResultsLabel>
        </S.ResultsStat>
        {results.errors > 0 && (
          <S.ResultsStat>
            <S.ResultsNumber error>
              {formatNumber(results.errors)}
            </S.ResultsNumber>
            <S.ResultsLabel>Errors</S.ResultsLabel>
          </S.ResultsStat>
        )}
      </S.ResultsGrid>

      {/* NEW: Enhanced metrics section */}
      <S.MetricsSection>
        <S.MetricItem>
          <S.MetricLabel>Success Rate:</S.MetricLabel>
          <S.MetricValue success={parseFloat(successRate) > 95}>
            {successRate}%
          </S.MetricValue>
        </S.MetricItem>
        <S.MetricItem>
          <S.MetricLabel>Processing Rate:</S.MetricLabel>
          <S.MetricValue>{formatNumber(rate)} comics/sec</S.MetricValue>
        </S.MetricItem>
        <S.MetricItem>
          <S.MetricLabel>Total Time:</S.MetricLabel>
          <S.MetricValue>
            {formatDuration(results.processingTime)}
          </S.MetricValue>
        </S.MetricItem>
      </S.MetricsSection>

      {/* NEW: Download options section */}
      <S.DownloadSection>
        <S.DownloadTitle>Download Reports</S.DownloadTitle>
        <S.DownloadButtons>
          <S.DownloadButton onClick={handleDownloadSummary}>
            <BarChart size={16} />
            Import Summary
          </S.DownloadButton>
          {results.processingErrors && results.processingErrors.length > 0 && (
            <S.DownloadButton
              variant="secondary"
              onClick={() => {
                // TODO: Implement error report download
                console.log("Error report download - to be implemented");
              }}
            >
              <FileText size={16} />
              Error Details
            </S.DownloadButton>
          )}
        </S.DownloadButtons>
      </S.DownloadSection>

      {/* Existing error display - enhanced */}
      {results.processingErrors && results.processingErrors.length > 0 && (
        <S.ErrorsList>
          <S.ErrorsTitle>
            Processing Errors (showing first{" "}
            {Math.min(results.processingErrors.length, 10)}):
          </S.ErrorsTitle>
          {results.processingErrors
            .slice(0, 10)
            .map((error: string, index: number) => (
              <S.ErrorItem key={index}>{error}</S.ErrorItem>
            ))}
          {results.processingErrors.length > 10 && (
            <S.ErrorItem>
              ... and {results.processingErrors.length - 10} more (download full
              error report)
            </S.ErrorItem>
          )}
        </S.ErrorsList>
      )}

      {/* NEW: Recommendations section */}
      {(results.errors > 0 ||
        (results.validationWarnings &&
          results.validationWarnings.length > 0)) && (
        <S.RecommendationsSection>
          <S.RecommendationsTitle>Recommendations</S.RecommendationsTitle>
          <S.RecommendationsList>
            {results.errors > results.processed * 0.1 && (
              <S.RecommendationItem>
                High error rate detected. Consider reviewing your CSV format and
                data quality.
              </S.RecommendationItem>
            )}
            {results.validationWarnings &&
              results.validationWarnings.length > 0 && (
                <S.RecommendationItem>
                  {results.validationWarnings.length} validation warnings found.
                  Download the import summary for details.
                </S.RecommendationItem>
              )}
            {results.updated > results.created && (
              <S.RecommendationItem>
                Most comics were updates rather than new additions. This might
                indicate duplicate imports.
              </S.RecommendationItem>
            )}
          </S.RecommendationsList>
        </S.RecommendationsSection>
      )}
    </S.ResultsContainer>
  );
};

export default ImportResultsDisplay;

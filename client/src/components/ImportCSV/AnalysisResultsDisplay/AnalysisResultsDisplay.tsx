import React from "react";
import { Search, Download } from "lucide-react";
import Button from "../../shared/Button";
import { formatNumber } from "../../../utils/formatters";
import {
  generateMissingComicsReport,
  downloadReport,
  generateReportFilename,
} from "../../../utils/reportGenerator";
import { AnalysisResult } from "../../../utils/types";
import { MissingComic, TypeMismatch } from "../../../utils/types";
import * as S from "./styles";

interface AnalysisResultsDisplayProps {
  results: AnalysisResult;
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  results,
}) => {
  if (!results) {
    return null;
  }

  const handleDownloadReport = () => {
    const report = generateMissingComicsReport(results, {
      maxMissingItems: 100,
      maxInvalidItems: 50,
      maxDuplicateItems: 50,
      includeDebuggingNotes: true,
    });

    const filename = generateReportFilename("missing-comics-analysis");
    downloadReport(report, filename);
  };

  return (
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
            {formatNumber(results.totalInFile)}
          </S.AnalysisNumber>
          <S.AnalysisLabel>In File</S.AnalysisLabel>
        </S.AnalysisStat>
        <S.AnalysisStat>
          <S.AnalysisNumber>
            {formatNumber(results.totalInDatabase)}
          </S.AnalysisNumber>
          <S.AnalysisLabel>In Database</S.AnalysisLabel>
        </S.AnalysisStat>
        <S.AnalysisStat>
          <S.AnalysisNumber error>
            {formatNumber(results.missing.length)}
          </S.AnalysisNumber>
          <S.AnalysisLabel>Missing</S.AnalysisLabel>
        </S.AnalysisStat>
        <S.AnalysisStat>
          <S.AnalysisNumber warning>
            {formatNumber(results.invalidComics.length)}
          </S.AnalysisNumber>
          <S.AnalysisLabel>Invalid</S.AnalysisLabel>
        </S.AnalysisStat>
        <S.AnalysisStat>
          <S.AnalysisNumber warning>
            {formatNumber(results.duplicatesInFile.length)}
          </S.AnalysisNumber>
          <S.AnalysisLabel>Duplicates</S.AnalysisLabel>
        </S.AnalysisStat>
      </S.AnalysisStatsGrid>

      {results.missing.length > 0 && (
        <S.MissingComicsList>
          <S.MissingComicsTitle>
            Missing Comics (showing first 20):
          </S.MissingComicsTitle>
          {results.missing
            .slice(0, 20)
            .map((comic: MissingComic, index: number) => (
              <S.MissingComicItem key={index}>
                <strong>{comic.publisher}</strong> - {comic.series}
                {comic.volume && ` (${comic.volume})`} #{comic.issue}
                {comic.type && ` [${comic.type}]`} - {comic.reason}
              </S.MissingComicItem>
            ))}
          {results.missing.length > 20 && (
            <S.MissingComicItem>
              ... and {results.missing.length - 20} more (download full report)
            </S.MissingComicItem>
          )}
        </S.MissingComicsList>
      )}

      {results.typeMismatches.length > 0 && (
        <S.MissingComicsList>
          <S.MissingComicsTitle>
            Type Mismatches (showing first 10):
          </S.MissingComicsTitle>
          {results.typeMismatches
            .slice(0, 10)
            .map((mismatch: TypeMismatch, index: number) => (
              <S.MissingComicItem key={index}>
                <strong>{mismatch.publisher}</strong> - {mismatch.series}
                {mismatch.volume && ` (${mismatch.volume})`} #{mismatch.issue} -
                File has "{mismatch.fileType}" but database has:{" "}
                {mismatch.databaseTypes.join(", ")}
              </S.MissingComicItem>
            ))}
        </S.MissingComicsList>
      )}
    </S.AnalysisResults>
  );
};

export default AnalysisResultsDisplay;

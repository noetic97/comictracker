import React, { useState } from "react";
import {
  Search,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "../../shared/Button";
import { formatNumber } from "../../../utils/formatters";
import {
  generateMissingComicsReport,
  generateMissingComicsCSV, // NEW
  downloadReport,
  generateReportFilename,
} from "../../../utils/reportGenerator";
import { AnalysisResult } from "../../../contracts/analysis";
import { MissingComic, TypeMismatch } from "../../../contracts/analysis";
import * as S from "./styles";

interface AnalysisResultsDisplayProps {
  results: AnalysisResult;
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
  results,
}) => {
  // NEW: State for expandable sections and filters
  const [expandedSections, setExpandedSections] = useState({
    missing: true,
    duplicates: false,
    invalid: false,
    typeMismatches: false,
  });

  const [showAllMissing, setShowAllMissing] = useState(false);

  if (!results) {
    return null;
  }

  // NEW: Handle text report download
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

  // NEW: Handle CSV export
  const handleDownloadCSV = () => {
    const csvContent = generateMissingComicsCSV(results);
    const filename = generateReportFilename("missing-comics", "csv");
    downloadReport(csvContent, filename);
  };

  // NEW: Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // NEW: Generate recommendations
  const getRecommendations = (): string[] => {
    const recommendations = [];

    if (results.typeMismatches.length > 5) {
      recommendations.push(
        "Consider standardizing Type field values (Issue, Annual, Special, etc.)"
      );
    }

    if (results.duplicatesInFile.length > results.missing.length * 0.1) {
      recommendations.push(
        "Remove duplicate rows from your CSV file before importing"
      );
    }

    if (results.invalidComics.length > results.totalInFile * 0.05) {
      recommendations.push(
        "Review CSV format - high number of invalid comic entries detected"
      );
    }

    if (results.missing.length === 0) {
      recommendations.push(
        "Great! All comics from your file are already in your collection"
      );
    } else if (results.missing.length > results.totalInFile * 0.8) {
      recommendations.push(
        "Consider importing these comics to build your collection"
      );
    }

    return recommendations;
  };

  const recommendations = getRecommendations();
  const displayMissingCount = showAllMissing
    ? results.missing.length
    : Math.min(20, results.missing.length);

  return (
    <S.AnalysisResults>
      <S.AnalysisResultsHeader>
        <S.AnalysisResultsTitle>
          <Search size={20} />
          Missing Comics Analysis
        </S.AnalysisResultsTitle>
        <S.DownloadButtons>
          <Button
            onClick={handleDownloadCSV}
            icon={FileSpreadsheet}
            size="small"
            variant="tertiary"
          >
            Export CSV
          </Button>
          <Button
            onClick={handleDownloadReport}
            icon={Download}
            size="small"
            variant="tertiary"
          >
            Download Report
          </Button>
        </S.DownloadButtons>
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

      {/* NEW: Recommendations section */}
      {recommendations.length > 0 && (
        <S.RecommendationsSection>
          <S.RecommendationsTitle>Recommendations</S.RecommendationsTitle>
          <S.RecommendationsList>
            {recommendations.map((rec, index) => (
              <S.RecommendationItem key={index}>{rec}</S.RecommendationItem>
            ))}
          </S.RecommendationsList>
        </S.RecommendationsSection>
      )}

      {/* Enhanced Missing Comics Section */}
      {results.missing.length > 0 && (
        <S.ExpandableSection>
          <S.SectionHeader onClick={() => toggleSection("missing")}>
            <S.SectionTitle>
              Missing Comics ({formatNumber(results.missing.length)})
            </S.SectionTitle>
            {expandedSections.missing ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </S.SectionHeader>

          {expandedSections.missing && (
            <S.SectionContent>
              <S.MissingComicsList>
                {results.missing
                  .slice(0, displayMissingCount)
                  .map((comic: MissingComic, index: number) => (
                    <S.MissingComicItem key={index}>
                      <S.ComicMainInfo>
                        <strong>{comic.publisher}</strong> - {comic.series}
                        {comic.volume && ` (${comic.volume})`} #{comic.issue}
                        {comic.type && ` [${comic.type}]`}
                      </S.ComicMainInfo>
                      <S.ComicMetaInfo>
                        <span>${comic.currentValue}</span>
                        <span>{comic.reason}</span>
                      </S.ComicMetaInfo>
                    </S.MissingComicItem>
                  ))}

                {results.missing.length > 20 && !showAllMissing && (
                  <S.ShowMoreButton onClick={() => setShowAllMissing(true)}>
                    Show all {formatNumber(results.missing.length)} missing
                    comics
                  </S.ShowMoreButton>
                )}

                {showAllMissing && results.missing.length > 20 && (
                  <S.ShowMoreButton onClick={() => setShowAllMissing(false)}>
                    Show less
                  </S.ShowMoreButton>
                )}
              </S.MissingComicsList>
            </S.SectionContent>
          )}
        </S.ExpandableSection>
      )}

      {/* Enhanced Type Mismatches Section */}
      {results.typeMismatches.length > 0 && (
        <S.ExpandableSection>
          <S.SectionHeader onClick={() => toggleSection("typeMismatches")}>
            <S.SectionTitle>
              Type Mismatches ({formatNumber(results.typeMismatches.length)})
            </S.SectionTitle>
            {expandedSections.typeMismatches ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </S.SectionHeader>

          {expandedSections.typeMismatches && (
            <S.SectionContent>
              <S.MissingComicsList>
                {results.typeMismatches
                  .slice(0, 10)
                  .map((mismatch: TypeMismatch, index: number) => (
                    <S.MissingComicItem key={index}>
                      <S.ComicMainInfo>
                        <strong>{mismatch.publisher}</strong> -{" "}
                        {mismatch.series}
                        {mismatch.volume && ` (${mismatch.volume})`} #
                        {mismatch.issue}
                      </S.ComicMainInfo>
                      <S.ComicMetaInfo>
                        <span>File: "{mismatch.fileType}"</span>
                        <span>
                          Database: {mismatch.databaseTypes.join(", ")}
                        </span>
                      </S.ComicMetaInfo>
                    </S.MissingComicItem>
                  ))}
              </S.MissingComicsList>
            </S.SectionContent>
          )}
        </S.ExpandableSection>
      )}

      {/* Enhanced Duplicates Section */}
      {results.duplicatesInFile.length > 0 && (
        <S.ExpandableSection>
          <S.SectionHeader onClick={() => toggleSection("duplicates")}>
            <S.SectionTitle>
              File Duplicates ({formatNumber(results.duplicatesInFile.length)})
            </S.SectionTitle>
            {expandedSections.duplicates ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </S.SectionHeader>

          {expandedSections.duplicates && (
            <S.SectionContent>
              <S.MissingComicsList>
                {results.duplicatesInFile
                  .slice(0, 10)
                  .map((duplicate, index: number) => (
                    <S.MissingComicItem key={index}>
                      <S.ComicMainInfo>
                        <strong>{duplicate.publisher}</strong> -{" "}
                        {duplicate.series}
                        {duplicate.volume && ` (${duplicate.volume})`} #
                        {duplicate.issue}
                        {duplicate.type && ` [${duplicate.type}]`}
                      </S.ComicMainInfo>
                      <S.ComicMetaInfo>
                        <span>{duplicate.count} duplicates</span>
                        <span>
                          Rows:{" "}
                          {duplicate.fileIndices.map((i) => i + 1).join(", ")}
                        </span>
                      </S.ComicMetaInfo>
                    </S.MissingComicItem>
                  ))}
              </S.MissingComicsList>
            </S.SectionContent>
          )}
        </S.ExpandableSection>
      )}
    </S.AnalysisResults>
  );
};

export default AnalysisResultsDisplay;

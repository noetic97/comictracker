import React from "react";
import { CheckCircle, X } from "lucide-react";
import { formatDuration, formatNumber } from "../../../utils/formatters";
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

      <S.ResultsMeta>
        Total time: {formatDuration(results.processingTime)}
      </S.ResultsMeta>

      {results.processingErrors && results.processingErrors.length > 0 && (
        <S.ErrorsList>
          <S.ErrorsTitle>Processing Errors (showing first 10):</S.ErrorsTitle>
          {results.processingErrors.map((error: string, index: number) => (
            <S.ErrorItem key={index}>{error}</S.ErrorItem>
          ))}
        </S.ErrorsList>
      )}
    </S.ResultsContainer>
  );
};

export default ImportResultsDisplay;

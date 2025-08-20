import React from "react";
import { Search, X } from "lucide-react";
import Button from "../../shared/Button";
import { formatNumber } from "../../../utils/formatters";
import * as S from "./styles";

interface AnalysisSectionProps {
  persistedData: any[] | null;
  persistedTimestamp: string | null;
  isImporting: boolean;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClear: () => void;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  persistedData,
  persistedTimestamp,
  isImporting,
  isAnalyzing,
  onAnalyze,
  onClear,
}) => {
  // Don't show if no persisted data or currently importing
  if (!persistedData || persistedData.length === 0 || isImporting) {
    return null;
  }

  return (
    <S.AnalysisSection>
      <S.AnalysisTitle>
        <Search size={20} />
        Find Missing Comics
      </S.AnalysisTitle>
      <S.AnalysisDescription>
        Analyze which comics from your upload on {persistedTimestamp} are
        missing from the database. File contained{" "}
        {formatNumber(persistedData.length)} total records.
      </S.AnalysisDescription>
      <S.AnalysisButtonGroup>
        <Button
          onClick={onAnalyze}
          icon={Search}
          disabled={isAnalyzing}
          variant="secondary"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Missing Comics"}
        </Button>
        <Button onClick={onClear} icon={X} variant="tertiary" size="small">
          Clear
        </Button>
      </S.AnalysisButtonGroup>
    </S.AnalysisSection>
  );
};

export default AnalysisSection;

import React from "react";
import StatsDisplay from "../StatsDisplay";
import * as S from "./styles";

export interface ControlsSectionProps {
  isAllExpanded: boolean;
  onToggleAll: () => void;
  totalComics: number;
  filteredComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
  collectedValue: number;
  filterOption: string;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  isAllExpanded,
  onToggleAll,
  totalComics,
  filteredComics,
  collectedComics,
  grailComics,
  totalValue,
  collectedValue,
  filterOption,
}) => {
  return (
    <S.ControlsContainer>
      <S.ControlsRow>
        <S.ToggleButton onClick={onToggleAll}>
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </S.ToggleButton>

        <StatsDisplay
          totalComics={totalComics}
          filteredComics={filteredComics}
          collectedComics={collectedComics}
          grailComics={grailComics}
          totalValue={totalValue}
          collectedValue={collectedValue}
          filterOption={filterOption}
        />
      </S.ControlsRow>
    </S.ControlsContainer>
  );
};

export default ControlsSection;

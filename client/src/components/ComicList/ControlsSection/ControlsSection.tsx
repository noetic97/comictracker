import React from "react";
import StatsDisplay from "../StatsDisplay";
import { FilterOption } from "../../../types";
import * as S from "./styles";

interface ControlsSectionProps {
  isAllExpanded: boolean;
  onToggleAll: () => void;
  filterOption: FilterOption;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  isAllExpanded,
  onToggleAll,
  filterOption,
}) => {
  return (
    <S.ControlsContainer>
      <S.ControlsRow>
        <S.ToggleButton onClick={onToggleAll}>
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </S.ToggleButton>

        <StatsDisplay filterOption={filterOption} />
      </S.ControlsRow>
    </S.ControlsContainer>
  );
};

export default ControlsSection;

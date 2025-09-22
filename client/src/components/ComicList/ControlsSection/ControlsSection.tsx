import React, { useCallback } from "react";
import StatsDisplay from "../StatsDisplay";
import { FilterOption, FavoriteSeries, SortOption } from "../../../types";
import { logger } from "../../../utils/logger";
import * as S from "./styles";

interface ControlsSectionProps {
  isAllExpanded: boolean;
  onToggleAll: () => void;
  filterOption: FilterOption;
  searchFilter: string;
  sortBy: SortOption;
  favoriteSeries: FavoriteSeries[];
  onStatsRefreshReady?: (refreshStats: () => Promise<any>) => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  isAllExpanded,
  onToggleAll,
  filterOption,
  searchFilter,
  sortBy,
  favoriteSeries,
  onStatsRefreshReady,
}) => {
  const handleStatsRefreshReady = useCallback(
    (silentRefetch: () => Promise<any>) => {
      logger.stats.debug("Stats refresh ready", {
        hasCallback: !!onStatsRefreshReady,
        isFunction: typeof silentRefetch === "function",
      });
      if (onStatsRefreshReady) {
        logger.stats.debug("Calling stats refresh callback");
        onStatsRefreshReady(silentRefetch);
      }
    },
    [onStatsRefreshReady]
  );

  return (
    <S.ControlsContainer>
      <S.ControlsRow>
        <S.ToggleButton onClick={onToggleAll}>
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </S.ToggleButton>

        <StatsDisplay
          filterOption={filterOption}
          searchFilter={searchFilter}
          sortBy={sortBy}
          favoriteSeries={favoriteSeries}
          onSilentRefetchReady={handleStatsRefreshReady}
        />
      </S.ControlsRow>
    </S.ControlsContainer>
  );
};

export default ControlsSection;

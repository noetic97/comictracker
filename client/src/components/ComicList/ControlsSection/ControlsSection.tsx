import React, { useCallback } from "react";
import StatsDisplay from "../StatsDisplay";
import { FilterOption, FavoriteSeries, SortOption } from "../../../types";
import { logger } from "../../../utils/logger";
import * as S from "./styles";

interface ControlsSectionProps {
  filterOption: FilterOption;
  searchFilter: string;
  sortBy: SortOption;
  favoriteSeries: FavoriteSeries[];
  onStatsRefreshReady?: (refreshStats: () => Promise<any>) => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
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

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
  showHiddenPublishers?: boolean;
  onShowHiddenPublishersChange?: (show: boolean) => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  filterOption,
  searchFilter,
  sortBy,
  favoriteSeries,
  onStatsRefreshReady,
  showHiddenPublishers = false,
  onShowHiddenPublishersChange,
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
        {onShowHiddenPublishersChange != null && (
          <S.ShowHiddenLabel>
            <input
              type="checkbox"
              id="show-hidden-publishers"
              checked={showHiddenPublishers}
              onChange={(e) => onShowHiddenPublishersChange(e.target.checked)}
              aria-label="Show hidden publishers"
            />
            <label htmlFor="show-hidden-publishers">
              Show hidden publishers
            </label>
          </S.ShowHiddenLabel>
        )}
      </S.ControlsRow>
    </S.ControlsContainer>
  );
};

export default ControlsSection;

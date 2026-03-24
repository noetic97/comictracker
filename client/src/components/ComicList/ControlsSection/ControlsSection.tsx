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
  onOpenMultiPull?: () => void;
  canOpenMultiPull?: boolean;
  activePullListName?: string | null;
  onAutoHideCollectedPublishers?: () => Promise<void>;
  onAutoHideCollectedSeries?: () => Promise<void>;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  filterOption,
  searchFilter,
  sortBy,
  favoriteSeries,
  onStatsRefreshReady,
  onOpenMultiPull,
  canOpenMultiPull = false,
  activePullListName,
  onAutoHideCollectedPublishers,
  onAutoHideCollectedSeries,
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
        {onOpenMultiPull && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <S.ToggleButton
              type="button"
              onClick={onOpenMultiPull}
              disabled={!canOpenMultiPull}
              title={
                canOpenMultiPull
                  ? "Open named pull list view"
                  : "Create a pull list first"
              }
            >
              Open Multi-Pull
            </S.ToggleButton>
            {activePullListName && (
              <S.ActivePill title="Currently open pull list">
                Active: {activePullListName}
              </S.ActivePill>
            )}
          </div>
        )}
        {onAutoHideCollectedPublishers && (
          <S.ToggleButton
            type="button"
            onClick={() => onAutoHideCollectedPublishers()}
            title="Hide fully collected publishers"
          >
            Hide Collected Publishers
          </S.ToggleButton>
        )}
        {onAutoHideCollectedSeries && (
          <S.ToggleButton
            type="button"
            onClick={() => onAutoHideCollectedSeries()}
            title="Hide fully collected series"
          >
            Hide Collected Series
          </S.ToggleButton>
        )}
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

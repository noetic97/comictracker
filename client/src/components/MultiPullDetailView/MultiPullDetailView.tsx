import React, { useState } from "react";
import SeriesDetailView from "../SeriesDetailView";
import { FavoriteSeries, FilterOption, PullListDetail, SortOption } from "../../types";
import Button from "../shared/Button";
import * as S from "./styles";

interface MultiPullDetailViewProps {
  pullList: PullListDetail;
  onBack: () => void;
  onRemoveSeries: (series: { publisher: string; series: string; volume?: string }) => Promise<void>;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  favoriteSeries: FavoriteSeries[];
  onToggleFavoriteSeries: (publisher: string, series: string, volume: string) => void;
  filterOption: FilterOption;
  searchFilter: string;
  filterType?: string;
  filterGrade?: string;
  filterMinValue?: string;
  filterMaxValue?: string;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  setSortBy: (v: SortOption) => void;
  setSortOrder: (v: "asc" | "desc") => void;
}

const MultiPullDetailView: React.FC<MultiPullDetailViewProps> = ({
  pullList,
  onBack,
  onRemoveSeries,
  itemsPerPage,
  setItemsPerPage,
  favoriteSeries,
  onToggleFavoriteSeries,
  filterOption,
  searchFilter,
  filterType = "",
  filterGrade = "",
  filterMinValue = "",
  filterMaxValue = "",
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [page, setPage] = useState(1);

  const tabs = pullList.series;
  const active = tabs[Math.min(activeIdx, Math.max(0, tabs.length - 1))];

  if (!active) {
    return (
      <S.EmptyState>
        <Button onClick={onBack} variant="secondary" size="small">
          Back
        </Button>
        <h2 style={{ marginTop: "1rem" }}>{pullList.name}</h2>
        <p>This pull list is empty. Add series from the grid first.</p>
      </S.EmptyState>
    );
  }

  return (
    <S.Container>
      <S.HeaderRow>
        <Button onClick={onBack} variant="secondary" size="small">
          Back to Grid
        </Button>
        <S.ListName>{pullList.name}</S.ListName>
      </S.HeaderRow>

      <S.TabsRow>
        {tabs.map((t, idx) => {
          const label = t.volume ? `${t.series} (${t.volume})` : t.series;
          const isActive = idx === activeIdx;
          return (
            <S.TabGroup key={`${t.publisher}|${t.series}|${t.volume}`}>
              <S.TabButton
                type="button"
                $active={isActive}
                onClick={() => {
                  setActiveIdx(idx);
                  setPage(1);
                }}
              >
                {label}
              </S.TabButton>
              <S.RemoveTabButton
                type="button"
                aria-label={`Remove ${label} from pull list`}
                onClick={async () => {
                  await onRemoveSeries(t);
                  if (activeIdx >= idx && activeIdx > 0) setActiveIdx(activeIdx - 1);
                }}
              >
                x
              </S.RemoveTabButton>
            </S.TabGroup>
          );
        })}
      </S.TabsRow>

      <SeriesDetailView
        publisher={active.publisher}
        series={active.series}
        volume={active.volume}
        onBack={onBack}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        filterOption={filterOption}
        searchFilter={searchFilter}
        filterType={filterType}
        filterGrade={filterGrade}
        filterMinValue={filterMinValue}
        filterMaxValue={filterMaxValue}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        favoriteSeries={favoriteSeries}
        isFavorite={favoriteSeries.some(
          (fav) =>
            fav.publisher === active.publisher &&
            fav.series === active.series &&
            fav.volume === (active.volume || "")
        )}
        onToggleFavorite={() =>
          onToggleFavoriteSeries(active.publisher, active.series, active.volume || "")
        }
        currentPage={page}
        setCurrentPage={setPage}
      />
    </S.Container>
  );
};

export default MultiPullDetailView;

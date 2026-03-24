import React, { memo } from "react";
import { X } from "lucide-react";
import { FilterOption, SortOption } from "../../types";
import Input from "../shared/Input";
import { useDistinctTypes } from "../../hooks";
import * as S from "./styles";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  filterOption: FilterOption;
  setFilterOption: (option: FilterOption) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterGrade: string;
  setFilterGrade: (value: string) => void;
  filterMinValue: string;
  setFilterMinValue: (value: string) => void;
  filterMaxValue: string;
  setFilterMaxValue: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  /** Reset all filter fields to defaults (search, filter option, type, grade, value range). */
  onClearAllFilters?: () => void;
  onOpenMultiPull?: () => void;
  activePullListName?: string | null;
}

const FilterSort: React.FC<Props> = memo(
  ({
    filter,
    setFilter,
    filterOption,
    setFilterOption,
    sortBy,
    setSortBy,
    itemsPerPage,
    setItemsPerPage,
    filterType,
    setFilterType,
    filterGrade,
    setFilterGrade,
    filterMinValue,
    setFilterMinValue,
    filterMaxValue,
    setFilterMaxValue,
    isOpen,
    onClose,
    onClearAllFilters,
    onOpenMultiPull,
    activePullListName,
  }) => {
    const { types: typeOptions } = useDistinctTypes(isOpen);

    return (
      <S.FilterSortContainer $isOpen={isOpen} data-sc="FilterSortContainer">
        <S.FilterSortContent data-sc="FilterSortContent">
          <S.CloseButton onClick={onClose} data-sc="CloseButton">
            <X size={24} />
          </S.CloseButton>

          {onClearAllFilters && (
            <S.ClearFiltersButton
              type="button"
              onClick={onClearAllFilters}
              data-sc="ClearFiltersButton"
            >
              Clear filters
            </S.ClearFiltersButton>
          )}
          {onOpenMultiPull && (
            <S.ClearFiltersButton
              type="button"
              onClick={onOpenMultiPull}
              data-sc="OpenMultiPullButton"
            >
              Open Multi-Pull
              {activePullListName ? ` (${activePullListName})` : ""}
            </S.ClearFiltersButton>
          )}

          <Input
            label="Search"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onClear={() => setFilter("")}
            placeholder="Filter publishers, series, comics..."
            data-sc="SearchInput"
          />

          <S.FilterLabel>Filter by</S.FilterLabel>
          <S.StyledSelect
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
            data-sc="FilterOptionSelect"
          >
            <option value="all">All Comics</option>
            <option value="favoriteSeriesOnly">Favorite Series Only</option>
            <option value="grailComicsOnly">Grail Comics Only</option>
            <option value="collected">Collected Only</option>
            <option value="uncollected">Uncollected Only</option>
          </S.StyledSelect>

          <S.FilterLabel>Type</S.FilterLabel>
          <S.StyledSelect
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            data-sc="FilterTypeSelect"
          >
            <option value="">Any</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </S.StyledSelect>

          <S.FilterLabel>Value range</S.FilterLabel>
          <S.ValueRangeRow>
            <S.ValueInputWrap>
              <S.ValueInput
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="Min $"
                value={filterMinValue}
                onChange={(e) => setFilterMinValue(e.target.value)}
                aria-label="Minimum value (whole dollars)"
                data-sc="FilterMinValue"
                $hasValue={!!filterMinValue}
              />
              {filterMinValue ? (
                <S.ValueClearButton
                  type="button"
                  onClick={() => setFilterMinValue("")}
                  aria-label="Clear minimum value"
                  data-sc="ClearMinValue"
                >
                  <X size={14} />
                </S.ValueClearButton>
              ) : null}
            </S.ValueInputWrap>
            <span>–</span>
            <S.ValueInputWrap>
              <S.ValueInput
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                placeholder="Max $"
                value={filterMaxValue}
                onChange={(e) => setFilterMaxValue(e.target.value)}
                aria-label="Maximum value (whole dollars)"
                data-sc="FilterMaxValue"
                $hasValue={!!filterMaxValue}
              />
              {filterMaxValue ? (
                <S.ValueClearButton
                  type="button"
                  onClick={() => setFilterMaxValue("")}
                  aria-label="Clear maximum value"
                  data-sc="ClearMaxValue"
                >
                  <X size={14} />
                </S.ValueClearButton>
              ) : null}
            </S.ValueInputWrap>
          </S.ValueRangeRow>

          <S.FilterLabel>Items per page</S.FilterLabel>
          <S.StyledSelect
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            data-sc="ItemsPerPageSelect"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={2000}>2000 (max)</option>
          </S.StyledSelect>

        </S.FilterSortContent>
      </S.FilterSortContainer>
    );
  }
);

FilterSort.displayName = "FilterSort";

export default FilterSort;

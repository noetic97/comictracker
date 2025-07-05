import React, { memo } from "react";
import { X } from "lucide-react";
import { SortOption, FilterOption } from "../../types";
import Input from "../shared/Input";
import * as S from "./styles";
import Toggle from "../shared/Toggle";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: SortOption | "issueNumber";
  setSortBy: (sortBy: SortOption | "issueNumber") => void;
  filterOption: FilterOption;
  setFilterOption: (option: FilterOption) => void;
  hideCollected: boolean;
  setHideCollected: (hide: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSort: React.FC<Props> = memo(
  ({
    filter,
    setFilter,
    sortBy,
    setSortBy,
    filterOption,
    setFilterOption,
    hideCollected,
    setHideCollected,
    itemsPerPage,
    setItemsPerPage,
    isOpen,
    onClose,
  }) => {
    return (
      <S.FilterSortContainer $isOpen={isOpen} data-sc="FilterSortContainer">
        <S.FilterSortContent data-sc="FilterSortContent">
          <S.CloseButton onClick={onClose} data-sc="CloseButton">
            <X size={24} />
          </S.CloseButton>

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

          <S.FilterLabel>Sort by</S.FilterLabel>
          <S.StyledSelect
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as SortOption | "issueNumber")
            }
            data-sc="SortBySelect"
          >
            <option value="series">Series (Alphabetical, ignores "the")</option>
            <option value="publisher">Publisher</option>
            <option value="currentValue">Current Value</option>
            <option value="issue">Issue (Alphabetically)</option>
            <option value="issueNumber">Issue Number (Numerically)</option>
          </S.StyledSelect>

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
          </S.StyledSelect>

          <S.ToggleContainer>
            <S.FilterLabel>Hide Collected</S.FilterLabel>
            <Toggle
              checked={hideCollected}
              onChange={() => setHideCollected(!hideCollected)}
            />
          </S.ToggleContainer>
        </S.FilterSortContent>
      </S.FilterSortContainer>
    );
  }
);

FilterSort.displayName = "FilterSort";

export default FilterSort;

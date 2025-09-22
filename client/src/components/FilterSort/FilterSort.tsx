import React, { memo } from "react";
import { X } from "lucide-react";
import { FilterOption, SortOption } from "../../types";
import Input from "../shared/Input";
import * as S from "./styles";
// import Toggle from "../shared/Toggle"; // Unused for now

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  filterOption: FilterOption;
  setFilterOption: (option: FilterOption) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  isOpen: boolean;
  onClose: () => void;
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
            onChange={(e) => {
              console.log("🔄 FilterSort sortBy changed:", e.target.value);
              setSortBy(e.target.value as SortOption);
            }}
            data-sc="SortBySelect"
          >
            <option value="series">Series</option>
            <option value="publisher">Publisher</option>
            <option value="currentValue">Current Value</option>
            <option value="pricePaid">Price Paid</option>
            <option value="grade">Grade</option>
            <option value="dateAdded">Date Added</option>
            <option value="issue">Issue</option>
            <option value="issueNumber">Issue Number</option>
            <option value="collected">Collected Status</option>
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
            <option value={10000}>All</option>
          </S.StyledSelect>

          {/* TODO: Add hide collected toggle support to server-side API */}
        </S.FilterSortContent>
      </S.FilterSortContainer>
    );
  }
);

FilterSort.displayName = "FilterSort";

export default FilterSort;

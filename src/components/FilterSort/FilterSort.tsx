import React from "react";
import { X } from "lucide-react";
import { SortOption } from "../../types";
import * as S from "./styles";
import Toggle from "../shared/Toggle";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: SortOption | "issueNumber";
  setSortBy: (sortBy: SortOption | "issueNumber") => void;
  hideCollected: boolean;
  setHideCollected: (hide: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSort: React.FC<Props> = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  hideCollected,
  setHideCollected,
  itemsPerPage,
  setItemsPerPage,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <S.FilterSortContainer isOpen={isOpen} data-sc="FilterSortContainer">
      <S.FilterSortContent data-sc="FilterSortContent">
        <S.CloseButton onClick={onClose} data-sc="CloseButton">
          <X size={24} />
        </S.CloseButton>
        <S.FilterLabel>Filter</S.FilterLabel>
        <S.InputContainer data-sc="InputContainer">
          <S.StyledInput
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter comics..."
            data-sc="StyledInput"
          />
          {filter && (
            <S.ClearButton
              onClick={() => setFilter("")}
              data-sc="ClearButton"
            />
          )}
        </S.InputContainer>
        <S.FilterLabel>Sort by</S.FilterLabel>
        <S.StyledSelect
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as SortOption | "issueNumber")
          }
          data-sc="StyledSelect"
        >
          <option value="series">Series</option>
          <option value="publisher">Publisher</option>
          <option value="currentValue">Current Value</option>
          <option value="issue">Issue (Alphabetically)</option>
          <option value="issueNumber">Issue Number (Numerically)</option>
        </S.StyledSelect>
        <S.FilterLabel>Items per page</S.FilterLabel>
        <S.StyledSelect
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          data-sc="StyledSelect"
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
};

export default FilterSort;

import React from "react";
import { Comic } from "../../types";
import * as S from "./styles";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: keyof Comic | "issueNumber";
  setSortBy: (sortBy: keyof Comic | "issueNumber") => void;
  hideCollected: boolean;
  setHideCollected: (hide: boolean) => void;
}

const FilterSort: React.FC<Props> = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  hideCollected,
  setHideCollected,
}) => {
  return (
    <S.FilterSortContainer>
      <S.InputContainer>
        <S.StyledInput
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter comics..."
        />
        {filter && <S.ClearButton size={18} onClick={() => setFilter("")} />}
      </S.InputContainer>
      <S.StyledSelect
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value as keyof Comic | "issueNumber")
        }
      >
        <option value="series">Sort by Series</option>
        <option value="publisher">Sort by Publisher</option>
        <option value="currentValue">Sort by Current Value</option>
        <option value="issue">Sort by Issue (Alphabetically)</option>
        <option value="issueNumber">Sort by Issue Number (Numerically)</option>
        <option value="collected">Sort by Collected Issues</option>
      </S.StyledSelect>
      <S.CheckboxLabel>
        <input
          type="checkbox"
          checked={hideCollected}
          onChange={(e) => setHideCollected(e.target.checked)}
        />
        Hide Collected
      </S.CheckboxLabel>
    </S.FilterSortContainer>
  );
};

export default FilterSort;

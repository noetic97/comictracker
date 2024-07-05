import React from "react";
import { Comic } from "../types";
import { StyledInput, StyledSelect, StyledControls } from "../styles/index";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: keyof Comic;
  setSortBy: (sortBy: keyof Comic) => void;
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
    <StyledControls>
      <StyledInput
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter comics..."
      />
      <StyledSelect
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as keyof Comic)}
      >
        <option value="series">Sort by Series</option>
        <option value="publisher">Sort by Publisher</option>
        <option value="currentValue">Sort by Current Value</option>
        <option value="issue">Sort by Issue Number</option>
        <option value="collected">Sort by Collected Issues</option>
      </StyledSelect>
      <label>
        <input
          type="checkbox"
          checked={hideCollected}
          onChange={(e) => setHideCollected(e.target.checked)}
        />
        Hide Collected
      </label>
    </StyledControls>
  );
};

export default FilterSort;

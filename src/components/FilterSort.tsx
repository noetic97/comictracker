import React from "react";
import { Comic } from "../types";

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
    <div className="mb-4">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter comics..."
        className="p-2 border rounded mr-2"
      />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as keyof Comic)}
        className="p-2 border rounded"
      >
        <option value="Series">Sort by Series</option>
        <option value="Publisher">Sort by Publisher</option>
        <option value="CurrentValue">Sort by Current Value</option>
        <option value="Issue">Sort by Issue Number</option>
        <option value="Collected">Sort by Collected Issues</option>
      </select>
      <label className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={hideCollected}
          onChange={(e) => setHideCollected(e.target.checked)}
          className="mr-2"
        />
        Hide Collected
      </label>
    </div>
  );
};

export default FilterSort;

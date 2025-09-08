import React from "react";
import * as S from "./styles";

interface ViewControlsProps {
  sortOrder: "asc" | "desc";
  onSortChange: (order: "asc" | "desc") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  onCurrentPageReset: () => void; // Reset to page 1 when items per page changes
}

const ViewControls: React.FC<ViewControlsProps> = ({
  sortOrder,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  onCurrentPageReset,
}) => {
  const itemsPerPageOptions = [10, 25, 50, 100, "All"];

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    onItemsPerPageChange(newItemsPerPage);
    onCurrentPageReset(); // Reset to first page when changing items per page
  };

  return (
    <S.ViewControlsContainer>
      <S.SortControls>
        <S.ControlLabel>Sort:</S.ControlLabel>
        <S.CompactSelect
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as "asc" | "desc")}
        >
          <option value="asc">Issue # ↑</option>
          <option value="desc">Issue # ↓</option>
        </S.CompactSelect>
      </S.SortControls>

      <S.ItemsPerPageControl>
        <S.ControlLabel>Items:</S.ControlLabel>
        <S.CompactSelect
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </S.CompactSelect>
      </S.ItemsPerPageControl>
    </S.ViewControlsContainer>
  );
};

export default ViewControls;

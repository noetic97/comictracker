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
  const itemsPerPageOptions: { value: number; label: string }[] = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
    { value: 50000, label: "All" },
  ];

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
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </S.CompactSelect>
      </S.ItemsPerPageControl>
    </S.ViewControlsContainer>
  );
};

export default ViewControls;

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { SortOption, DETAIL_VIEW_SORT_OPTIONS, getSortOptionLabel } from "../../../types";
import * as S from "./styles";

interface ViewControlsProps {
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: SortOption, sortOrder: "asc" | "desc") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  onCurrentPageReset: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  onCurrentPageReset,
}) => {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  const itemsPerPageOptions: { value: number; label: string }[] = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
    { value: 2000, label: "2000 (max)" },
  ];

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    onItemsPerPageChange(newItemsPerPage);
    onCurrentPageReset();
  };

  const handleSortOptionClick = (field: SortOption) => {
    if (field === sortBy) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "asc");
    }
    setSortOpen(false);
  };

  const arrow = sortOrder === "asc" ? "↑" : "↓";
  const currentLabel = `${getSortOptionLabel(sortBy)} ${arrow}`;

  return (
    <S.ViewControlsContainer>
      <S.SortControls ref={sortRef}>
        <S.ControlLabel>Sort:</S.ControlLabel>
        <S.SortDropdownButton
          type="button"
          onClick={() => setSortOpen((o) => !o)}
          aria-expanded={sortOpen}
          aria-haspopup="listbox"
          aria-label={`Sort by ${currentLabel}`}
          data-sc="SortSelect"
        >
          <span>{currentLabel}</span>
          <ChevronDown size={14} style={{ flexShrink: 0 }} />
        </S.SortDropdownButton>
        {sortOpen && (
          <S.SortDropdownPanel role="listbox">
            {DETAIL_VIEW_SORT_OPTIONS.map((field) => (
              <S.SortDropdownOption
                key={field}
                type="button"
                role="option"
                aria-selected={field === sortBy}
                $selected={field === sortBy}
                onClick={() => handleSortOptionClick(field)}
              >
                <span>{getSortOptionLabel(field)}</span>
                {field === sortBy ? <span>{arrow}</span> : null}
              </S.SortDropdownOption>
            ))}
          </S.SortDropdownPanel>
        )}
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

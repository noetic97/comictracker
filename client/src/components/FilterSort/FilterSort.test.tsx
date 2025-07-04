import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import FilterSort from "./FilterSort";

// Mock the styled-components
vi.mock("./styles", () => ({
  FilterSortContainer: ({
    children,
    ...props
  }: React.PropsWithChildren<{ $isOpen: boolean }>) =>
    props.$isOpen ? (
      <div data-testid="filter-sort-container">{children}</div>
    ) : null,
  FilterSortContent: (props: React.PropsWithChildren) => (
    <div data-testid="filter-sort-content" {...props} />
  ),
  CloseButton: (props: React.PropsWithChildren) => (
    <button data-testid="close-button" {...props} />
  ),
  FilterLabel: (props: React.PropsWithChildren) => (
    <label data-testid="filter-label" {...props} />
  ),
  StyledSelect: ({
    children,
    ...props
  }: React.PropsWithChildren<{ "data-sc": string }>) => (
    <select data-testid={`styled-select-${props["data-sc"]}`} {...props}>
      {children}
    </select>
  ),
  ToggleContainer: (props: React.PropsWithChildren) => (
    <div data-testid="toggle-container" {...props} />
  ),
}));

// Mock the Input component
vi.mock("../shared/Input", () => ({
  default: ({
    onClear,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    onClear?: () => void;
  }) => (
    <div>
      <input data-testid="mock-input" {...props} />
      {onClear && (
        <button data-testid="clear-button" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  ),
}));

// Mock the Toggle component
vi.mock("../shared/Toggle", () => ({
  default: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input type="checkbox" data-testid="mock-toggle" {...props} />
  ),
}));

describe("FilterSort Component", () => {
  const mockSetFilter = vi.fn();
  const mockSetSortBy = vi.fn();
  const mockSetHideCollected = vi.fn();
  const mockSetItemsPerPage = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    filter: "",
    setFilter: mockSetFilter,
    sortBy: "series" as const,
    setSortBy: mockSetSortBy,
    hideCollected: false,
    setHideCollected: mockSetHideCollected,
    itemsPerPage: 25,
    setItemsPerPage: mockSetItemsPerPage,
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders correctly when open", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    expect(screen.getByTestId("filter-sort-container")).toBeInTheDocument();
  });
  it("does not render when closed", () => {
    render(
      <FilterSort
        {...defaultProps}
        isOpen={false}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    expect(
      screen.queryByTestId("filter-sort-container")
    ).not.toBeInTheDocument();
  });
  it("calls onClose when close button is clicked", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("close-button"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it("updates filter when input changes", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("mock-input"), {
      target: { value: "new filter" },
    });
    expect(mockSetFilter).toHaveBeenCalledWith("new filter");
  });
  it("updates sortBy when select changes", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("styled-select-SortBySelect"), {
      target: { value: "publisher" },
    });
    expect(mockSetSortBy).toHaveBeenCalledWith("publisher");
  });
  it("updates itemsPerPage when select changes", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("styled-select-ItemsPerPageSelect"), {
      target: { value: "50" },
    });
    expect(mockSetItemsPerPage).toHaveBeenCalledWith(50);
  });
  it("toggles hideCollected when toggle is clicked", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("mock-toggle"));
    expect(mockSetHideCollected).toHaveBeenCalledWith(true);
  });
  it("updates filter when input changes", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.change(screen.getByTestId("mock-input"), {
      target: { value: "new filter" },
    });
    expect(mockSetFilter).toHaveBeenCalledWith("new filter");
  });
  it("clears filter when clear button is clicked", () => {
    render(
      <FilterSort
        {...defaultProps}
        filterOption="all"
        setFilterOption={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId("clear-button"));
    expect(mockSetFilter).toHaveBeenCalledWith("");
  });
});

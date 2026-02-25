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
  ShowHiddenGroup: (props: React.PropsWithChildren) => (
    <div data-testid="show-hidden-group" {...props} />
  ),
  ShowHiddenLabel: (props: React.PropsWithChildren) => (
    <label data-testid="show-hidden-label" {...props} />
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
  const mockSetItemsPerPage = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnShowHiddenPublishersChange = vi.fn();
  const mockOnShowHiddenSeriesChange = vi.fn();

  const defaultProps = {
    filter: "",
    setFilter: mockSetFilter,
    filterOption: "all" as const,
    setFilterOption: vi.fn(),
    sortBy: "series" as const,
    setSortBy: mockSetSortBy,
    itemsPerPage: 25,
    setItemsPerPage: mockSetItemsPerPage,
    showHiddenPublishers: false,
    onShowHiddenPublishersChange: mockOnShowHiddenPublishersChange,
    showHiddenSeries: false,
    onShowHiddenSeriesChange: mockOnShowHiddenSeriesChange,
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders correctly when open", () => {
    render(<FilterSort {...defaultProps} />);
    expect(screen.getByTestId("filter-sort-container")).toBeInTheDocument();
  });
  it("does not render when closed", () => {
    render(<FilterSort {...defaultProps} isOpen={false} />);
    expect(
      screen.queryByTestId("filter-sort-container")
    ).not.toBeInTheDocument();
  });
  it("calls onClose when close button is clicked", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.click(screen.getByTestId("close-button"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it("updates filter when input changes", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.change(screen.getByTestId("mock-input"), {
      target: { value: "new filter" },
    });
    expect(mockSetFilter).toHaveBeenCalledWith("new filter");
  });
  it("updates sortBy when select changes", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.change(screen.getByTestId("styled-select-SortBySelect"), {
      target: { value: "publisher" },
    });
    expect(mockSetSortBy).toHaveBeenCalledWith("publisher");
  });
  it("updates itemsPerPage when select changes", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.change(screen.getByTestId("styled-select-ItemsPerPageSelect"), {
      target: { value: "50" },
    });
    expect(mockSetItemsPerPage).toHaveBeenCalledWith(50);
  });
  it("toggles show hidden publishers when checkbox is clicked", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Show hidden publishers"));
    expect(mockOnShowHiddenPublishersChange).toHaveBeenCalledWith(true);
  });
  it("toggles show hidden series when checkbox is clicked", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Show hidden series"));
    expect(mockOnShowHiddenSeriesChange).toHaveBeenCalledWith(true);
  });
  it("clears filter when clear button is clicked", () => {
    render(<FilterSort {...defaultProps} />);
    fireEvent.click(screen.getByTestId("clear-button"));
    expect(mockSetFilter).toHaveBeenCalledWith("");
  });
});

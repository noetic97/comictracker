export type SortOption =
  | "series"
  | "publisher"
  | "currentValue"
  | "pricePaid"
  | "grade"
  | "dateAdded"
  | "issue"
  | "issueNumber"
  | "collected"
  | "type";

/** Sort options shown in detail view (series scope); main view has no sort UI. */
export const DETAIL_VIEW_SORT_OPTIONS: SortOption[] = [
  "issueNumber",
  "currentValue",
  "pricePaid",
  "grade",
  "dateAdded",
  "collected",
  "type",
];

const SORT_OPTION_LABELS: Record<SortOption, string> = {
  series: "Series",
  publisher: "Publisher",
  currentValue: "Current Value",
  pricePaid: "Price Paid",
  grade: "Grade",
  dateAdded: "Date Added",
  issue: "Issue",
  issueNumber: "Issue Number",
  collected: "Collected Status",
  type: "Type",
};

export function getSortOptionLabel(field: SortOption): string {
  return SORT_OPTION_LABELS[field] ?? field;
}

export type FilterOption =
  | "all"
  | "favoriteSeriesOnly"
  | "grailComicsOnly"
  | "collected"
  | "uncollected"
  | "signed" // New filter option
  | "graded" // New filter option
  | "ungraded"; // New filter option

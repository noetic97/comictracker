export type SortOption =
  | "series"
  | "publisher"
  | "currentValue"
  | "pricePaid" // New sort option
  | "grade" // New sort option
  | "dateAdded" // New sort option
  | "issue"
  | "issueNumber"
  | "collected";

export type FilterOption =
  | "all"
  | "favoriteSeriesOnly"
  | "grailComicsOnly"
  | "collected"
  | "uncollected"
  | "signed" // New filter option
  | "graded" // New filter option
  | "ungraded"; // New filter option

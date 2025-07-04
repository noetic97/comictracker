export interface Comic {
  id: string;
  publisher: string;
  series: string;
  volume: string;
  years: string;
  type: string;
  issue: string;
  issueNumber: number;
  currentValue: number;
  collected: boolean;
  isGrail?: boolean; // New: Individual comic grail status
}

export interface FavoriteSeries {
  id: string;
  publisher: string;
  series: string;
  volume: string;
  dateAdded: number;
}

export type SortOption =
  | "series"
  | "publisher"
  | "currentValue"
  | "issue"
  | "issueNumber"
  | "collected";

export type FilterOption =
  | "all"
  | "favoriteSeriesOnly"
  | "grailComicsOnly"
  | "collected"
  | "uncollected";

interface GroupedComics {
  [key: string]: Comic[];
}

export interface PublisherGroupedComics {
  [publisher: string]: GroupedComics;
}

// New: Route types for navigation
export type ViewMode = "grid" | "series-detail";

export interface SeriesDetailParams {
  publisher: string;
  series: string;
  volume?: string;
}

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
}

export type SortOption =
  | "series"
  | "publisher"
  | "currentValue"
  | "issue"
  | "issueNumber"
  | "collected";

interface GroupedComics {
  [key: string]: Comic[];
}

export interface PublisherGroupedComics {
  [publisher: string]: GroupedComics;
}

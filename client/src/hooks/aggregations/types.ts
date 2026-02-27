import { FilterOption, SortOption } from "../../types";

export interface AggregationFilters {
  publisher?: string;
  series?: string;
  volume?: string;
  collected?: boolean;
  isGrail?: boolean;
  signed?: boolean;
  grade?: string;
  type?: string;
  minValue?: number | string;
  maxValue?: number | string;
  storageLocation?: string;
  search?: string;
  filterOption?: FilterOption;
  sortBy?: SortOption;
  sortOrder?: "asc" | "desc";
}

export interface ComicStats {
  total: number;
  collected: number;
  grails: number;
  totalValue: number;
  collectedValue: number;
}

export interface PublisherSummary {
  publisher: string;
  seriesCount: number;
  totalComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
}

export interface SeriesSummary {
  publisher: string;
  series: string;
  volume: string;
  issueCount: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number;
  isFavorite?: boolean;
}

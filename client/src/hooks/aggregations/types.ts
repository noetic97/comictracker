import { FilterOption } from "../../types";

export interface AggregationFilters {
  publisher?: string;
  series?: string;
  volume?: string;
  collected?: boolean;
  isGrail?: boolean;
  signed?: boolean;
  grade?: string;
  storageLocation?: string;
  search?: string;
  filterOption?: FilterOption;
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

export interface Comic {
  id: string;
  publisher: string;
  series: string;
  volume?: string;
  issue: string;
  years?: string;
  currentValue?: number;
  collected: boolean;
  isGrail: boolean;
}

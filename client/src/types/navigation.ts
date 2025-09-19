// Route types for navigation (existing)
export type ViewMode = "grid" | "series-detail";

export interface SeriesDetailParams {
  publisher: string;
  series: string;
  volume?: string;
}

import type { FilterOption, SortOption } from "../types";

export interface ViewParams {
  publisher?: string;
  series?: string;
  volume?: string;
  page?: number;
  filter?: string;
  filterOption?: FilterOption;
  sortBy?: SortOption;
  itemsPerPage?: number;
}

const DEFAULT_ITEMS_PER_PAGE = 25;
const DEFAULT_SORT: SortOption = "series";
const DEFAULT_FILTER_OPTION: FilterOption = "all";

const VALID_FILTER_OPTIONS: FilterOption[] = [
  "all",
  "favoriteSeriesOnly",
  "grailComicsOnly",
  "collected",
  "uncollected",
  "signed",
  "graded",
  "ungraded",
];

const VALID_SORT_OPTIONS: SortOption[] = [
  "series",
  "publisher",
  "currentValue",
  "pricePaid",
  "grade",
  "dateAdded",
  "issue",
  "issueNumber",
  "collected",
];

export const LAST_VIEW_STORAGE_KEY = "comictracker_last_view";

function isViewStateShape(obj: unknown): obj is ViewState {
  if (obj == null || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.filter !== "string") return false;
  if (!VALID_FILTER_OPTIONS.includes(o.filterOption as FilterOption)) return false;
  if (!VALID_SORT_OPTIONS.includes(o.sortBy as SortOption)) return false;
  const ipp = o.itemsPerPage;
  if (typeof ipp !== "number" || Number.isNaN(ipp) || ipp < 1 || ipp > 2000)
    return false;
  const p = o.page;
  if (p !== undefined && p !== null && (typeof p !== "number" || Number.isNaN(p) || p < 1))
    return false;
  if (o.selectedSeries !== null && o.selectedSeries !== undefined) {
    const s = o.selectedSeries as Record<string, unknown>;
    if (
      typeof s !== "object" ||
      s === null ||
      typeof s.publisher !== "string" ||
      typeof s.series !== "string"
    )
      return false;
    if (s.volume !== undefined && s.volume !== null && typeof s.volume !== "string")
      return false;
  }
  return true;
}

export function getLastViewFromStorage(): ViewState | null {
  try {
    const raw = localStorage.getItem(LAST_VIEW_STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isViewStateShape(parsed)) return null;
    const state = parsed as ViewState;
    if (typeof state.page !== "number" || state.page < 1) state.page = 1;
    return state;
  } catch {
    return null;
  }
}

export function saveLastViewToStorage(state: ViewState): void {
  try {
    localStorage.setItem(LAST_VIEW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota or other storage errors
  }
}

export function parseViewParams(search: string): ViewParams {
  const params = new URLSearchParams(search);
  const publisher = params.get("publisher") ?? undefined;
  const series = params.get("series") ?? undefined;
  const volume = params.get("volume") ?? undefined;
  const filter = params.get("filter") ?? undefined;
  const filterOptionRaw = params.get("filterOption");
  const filterOption = VALID_FILTER_OPTIONS.includes(
    filterOptionRaw as FilterOption
  )
    ? (filterOptionRaw as FilterOption)
    : undefined;
  const sortByRaw = params.get("sortBy");
  const sortBy = VALID_SORT_OPTIONS.includes(sortByRaw as SortOption)
    ? (sortByRaw as SortOption)
    : undefined;
  const itemsPerPageRaw = params.get("itemsPerPage");
  let itemsPerPage: number | undefined;
  if (itemsPerPageRaw != null) {
    const n = parseInt(itemsPerPageRaw, 10);
    if (!Number.isNaN(n)) itemsPerPage = Math.min(2000, Math.max(1, n));
  }
  const pageRaw = params.get("page");
  let page: number | undefined;
  if (pageRaw != null) {
    const n = parseInt(pageRaw, 10);
    if (!Number.isNaN(n) && n >= 1) page = n;
  }

  return {
    ...(publisher && { publisher }),
    ...(series && { series }),
    ...(volume !== undefined && volume !== null && { volume }),
    ...(page != null && page > 1 && { page }),
    ...(filter !== undefined && { filter }),
    ...(filterOption && { filterOption }),
    ...(sortBy && { sortBy }),
    ...(itemsPerPage != null && itemsPerPage !== DEFAULT_ITEMS_PER_PAGE && { itemsPerPage }),
  };
}

export interface ViewState {
  selectedSeries: {
    publisher: string;
    series: string;
    volume?: string;
  } | null;
  page: number;
  filter: string;
  filterOption: FilterOption;
  sortBy: SortOption;
  itemsPerPage: number;
}

export function buildViewParams(state: ViewState): string {
  const params = new URLSearchParams();
  if (state.selectedSeries) {
    params.set("publisher", state.selectedSeries.publisher);
    params.set("series", state.selectedSeries.series);
    if (state.selectedSeries.volume != null && state.selectedSeries.volume !== "")
      params.set("volume", state.selectedSeries.volume);
    if (state.page > 1) params.set("page", String(state.page));
  }
  if (state.filter) params.set("filter", state.filter);
  if (state.filterOption !== DEFAULT_FILTER_OPTION)
    params.set("filterOption", state.filterOption);
  if (state.sortBy !== DEFAULT_SORT) params.set("sortBy", state.sortBy);
  if (state.itemsPerPage !== DEFAULT_ITEMS_PER_PAGE)
    params.set("itemsPerPage", String(state.itemsPerPage));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function applyViewParams(
  parsed: ViewParams
): Partial<ViewState> & { itemsPerPage: number; page: number } {
  return {
    selectedSeries:
      parsed.publisher && parsed.series
        ? {
            publisher: parsed.publisher,
            series: parsed.series,
            volume: parsed.volume,
          }
        : null,
    page: parsed.page != null && parsed.page >= 1 ? parsed.page : 1,
    filter: parsed.filter ?? "",
    filterOption: parsed.filterOption ?? DEFAULT_FILTER_OPTION,
    sortBy: parsed.sortBy ?? DEFAULT_SORT,
    itemsPerPage:
      parsed.itemsPerPage != null
        ? Math.min(2000, Math.max(1, parsed.itemsPerPage))
        : DEFAULT_ITEMS_PER_PAGE,
  };
}

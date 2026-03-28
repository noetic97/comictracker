const STORAGE_KEY = "comictracker_hidden_series";
const SHOW_HIDDEN_KEY = "comictracker_show_hidden_series";

/** Unique key for a series (publisher + series + volume). */
export function seriesStorageKey(
  publisher: string,
  series: string,
  volume: string
): string {
  return `${publisher}|${series}|${volume ?? ""}`;
}

export function getHiddenSeries(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function setHiddenSeries(keys: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

export function hideSeries(storageKey: string): void {
  const list = getHiddenSeries();
  if (list.includes(storageKey)) return;
  setHiddenSeries([...list, storageKey]);
}

export function unhideSeries(storageKey: string): void {
  const list = getHiddenSeries().filter((k) => k !== storageKey);
  setHiddenSeries(list);
}

export function getShowHiddenSeries(): boolean {
  try {
    const raw = localStorage.getItem(SHOW_HIDDEN_KEY);
    if (raw == null) return false;
    return raw === "true";
  } catch {
    return false;
  }
}

export function setShowHiddenSeries(show: boolean): void {
  try {
    localStorage.setItem(SHOW_HIDDEN_KEY, show ? "true" : "false");
  } catch {
    // ignore
  }
}

/** Remove legacy localStorage keys after preferences are stored in the API DB. */
export function clearHiddenSeriesLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SHOW_HIDDEN_KEY);
  } catch {
    // ignore
  }
}

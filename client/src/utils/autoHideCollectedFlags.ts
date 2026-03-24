const PUBLISHERS_KEY = "comictracker_auto_hide_publishers_applied";
const SERIES_KEY = "comictracker_auto_hide_series_applied";

/** Persisted so "Hide collected" active styling survives refresh (separate from hidden lists). */
export function getAutoHidePublishersApplied(): boolean {
  try {
    return localStorage.getItem(PUBLISHERS_KEY) === "1";
  } catch {
    return false;
  }
}

export function getAutoHideSeriesApplied(): boolean {
  try {
    return localStorage.getItem(SERIES_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAutoHidePublishersApplied(applied: boolean): void {
  try {
    localStorage.setItem(PUBLISHERS_KEY, applied ? "1" : "0");
  } catch {
    // ignore
  }
}

export function setAutoHideSeriesApplied(applied: boolean): void {
  try {
    localStorage.setItem(SERIES_KEY, applied ? "1" : "0");
  } catch {
    // ignore
  }
}

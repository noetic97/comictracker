const STORAGE_KEY = "comictracker_hidden_publishers";
const SHOW_HIDDEN_KEY = "comictracker_show_hidden_publishers";

export function getHiddenPublishers(): string[] {
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

export function setHiddenPublishers(publisherNames: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(publisherNames));
  } catch {
    // ignore
  }
}

export function hidePublisher(publisherName: string): void {
  const list = getHiddenPublishers();
  if (list.includes(publisherName)) return;
  setHiddenPublishers([...list, publisherName]);
}

export function unhidePublisher(publisherName: string): void {
  const list = getHiddenPublishers().filter((p) => p !== publisherName);
  setHiddenPublishers(list);
}

export function getShowHiddenPublishers(): boolean {
  try {
    const raw = localStorage.getItem(SHOW_HIDDEN_KEY);
    if (raw == null) return false;
    return raw === "true";
  } catch {
    return false;
  }
}

export function setShowHiddenPublishers(show: boolean): void {
  try {
    localStorage.setItem(SHOW_HIDDEN_KEY, show ? "true" : "false");
  } catch {
    // ignore
  }
}

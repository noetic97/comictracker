// Common articles to ignore when sorting
const ARTICLES = ["the", "a", "an"];

/**
 * Removes common articles from the beginning of a string for sorting purposes
 * @param text - The text to normalize
 * @returns The text with articles removed from the beginning
 */
export const normalizeForSorting = (text: string): string => {
  const trimmed = text.trim().toLowerCase();

  for (const article of ARTICLES) {
    if (trimmed.startsWith(article + " ")) {
      return trimmed.slice(article.length + 1);
    }
  }

  return trimmed;
};

/**
 * Creates a sort key for series that ignores articles
 * @param series - Series name
 * @param volume - Volume (optional)
 * @returns A normalized sort key
 */
export const createSeriesSortKey = (
  series: string,
  volume?: string
): string => {
  const normalizedSeries = normalizeForSorting(series);
  return volume
    ? `${normalizedSeries} - ${volume.toLowerCase()}`
    : normalizedSeries;
};

/**
 * Sorts an array of objects by series name, ignoring articles
 * @param items - Array of items with series and optional volume properties
 * @returns Sorted array
 */
export const sortBySeriesIgnoringArticles = <
  T extends { series: string; volume?: string }
>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    const aKey = createSeriesSortKey(a.series, a.volume);
    const bKey = createSeriesSortKey(b.series, b.volume);
    return aKey.localeCompare(bKey);
  });
};

/**
 * Groups series keys and sorts them ignoring articles
 * @param seriesKeys - Array of series keys (format: "Series Name" or "Series Name - Volume")
 * @returns Sorted array of series keys
 */
export const sortSeriesKeysIgnoringArticles = (
  seriesKeys: string[]
): string[] => {
  return [...seriesKeys].sort((a, b) => {
    // Split series key to extract series and volume
    const [seriesA, volumeA] = a.split(" - ");
    const [seriesB, volumeB] = b.split(" - ");

    const keyA = createSeriesSortKey(seriesA, volumeA);
    const keyB = createSeriesSortKey(seriesB, volumeB);

    return keyA.localeCompare(keyB);
  });
};

import { apiService } from "./apiService";
import { replaceAllComics, replaceAllFavoriteSeries } from "./db";
import { logger } from "./logger";

export const OFFLINE_LAST_SYNC_KEY = "offlineLastSyncAt";

/**
 * Pull full comics + favorites from the API into IndexedDB (comic-wantlist).
 * Updates localStorage timestamp. Does not touch React state.
 */
export async function syncCollectionToIndexedDB(): Promise<string> {
  logger.comics.info("Starting full offline sync of comics collection");

  const [{ comics }, favorites] = await Promise.all([
    apiService.comics.getAll(),
    apiService.favorites.getAll(),
  ]);

  logger.comics.info("Fetched comics for offline sync", {
    count: comics.length,
  });
  logger.comics.info("Fetched favorites for offline sync", {
    count: favorites.length,
  });

  await replaceAllComics(comics);
  await replaceAllFavoriteSeries(favorites);

  const timestamp = new Date().toISOString();
  window.localStorage.setItem(OFFLINE_LAST_SYNC_KEY, timestamp);

  logger.comics.info("Offline sync completed successfully", {
    syncedAt: timestamp,
  });

  window.dispatchEvent(
    new CustomEvent("comictracker-offline-collection-synced", {
      detail: { syncedAt: timestamp },
    }),
  );

  return timestamp;
}

# Future: IndexedDB sync for comic API mutations (facade)

**Status:** Not implemented — design note for possible later work.

## Goal

After a successful API call that mutates a comic (collect, grail, edit, bulk import, delete, etc.), update the `comic-wantlist` IndexedDB comics store so offline data stays aligned without relying only on full “Sync collection” runs.

## Why a façade

Avoid scattering `put`/`delete` logic across every component. Prefer a **single module** that wraps `apiService.comics` (or equivalent), calls the API, then updates IDB and invalidates merged-offline cache as needed. Optionally enforce with ESLint (`no-restricted-imports` so only the façade imports `apiService.comics` from feature code).

## Mutation inventory (as of last audit)

| `apiService.comics` | Used today | Call sites | Intended IDB follow-up |
|---------------------|------------|------------|-------------------------|
| `toggleCollected` | Yes | `comicStateManager.ts` | Upsert returned `Comic`; clear pending `collected` field (already partially handled in state manager). |
| `toggleGrail` | Yes | `comicStateManager.ts` | Upsert returned `Comic`; clear pending `isGrail` field. |
| `update` | Yes | `EditComicModal`, `SeriesComicList`, `SeriesDetailView` | Upsert returned `Comic`. |
| `bulkCreate` | Yes | `chunkProcessor.ts` | **Open question:** response is summary/counts, not necessarily full `Comic[]`. Options: rely on existing post-import `syncCollectionToIndexedDB()`, extend API to return rows, or batch refetch. |
| `getAll` | Yes | `offlineFullSync.ts`, `comicAnalyzer.ts` | Reads / full replace — not per-mutation; analyzer is read-only. |
| `getById`, `create`, `delete`, `getStats` | No callers yet | — | When added, route through façade with upsert/delete/none respectively. |

GET-only hooks (`useSeriesComics`, publisher/series/stats aggregations) do not need comic-row IDB writes.

## Suggested façade surface (sketch)

- `toggleCollected(id)` / `toggleGrail(id)` — wrap API + IDB + pending field cleanup.
- `updateComic(id, partial)` — wrap API + IDB upsert.
- `bulkCreateComics(chunk)` — wrap API + decide IDB strategy (see bulk row above).

## Related code today

- `client/src/utils/db.ts` — comics store, pending patches, `invalidateMergedOfflineComicsCache`.
- `client/src/utils/offlineFullSync.ts` — full pull + `replaceAllComics` / `replaceAllFavoriteSeries`.
- `client/src/utils/comicStateManager.ts` — toggles + offline pending behavior.

## References

- Discussion included an explicit **list-and-map** of all `apiService.comics` usages before any implementation.
- **bulkCreate** behavior should be confirmed against `POST /comics/bulk` response shape before choosing IDB strategy.

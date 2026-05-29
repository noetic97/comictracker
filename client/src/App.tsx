import React, { useState, useEffect, useRef, useCallback } from "react";
import { FilterOption, FavoriteSeries, HuntListDetail, SortOption } from "./types";
import ComicActionsErrorBoundary from "./components/shared/ComicActionErrorBoundary";
import ErrorMessage from "./components/shared/ErrorMessage";
import ImportModal from "./components/ImportModal";
import Header from "./components/Header/index.ts";
import FilterSort from "./components/FilterSort/index.ts";
import ComicList from "./components/ComicList/index.ts";
import HamburgerMenu from "./components/HamburgerMenu/index.ts";
import Modal from "./components/shared/Modal";
import Button from "./components/shared/Button";
import { logger } from "./utils/logger";
import * as S from "./styles";
import { apiService } from "./utils/apiService";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "./themes/ThemeContext.tsx";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "./GlobalStyles.ts";
import {
  LoadingManagerProvider,
  useLoadingManager,
} from "./components/shared/LoadingManager";
import ComicLoadingSpinner from "./components/shared/ComicLoadingSpinner";
import {
  parseViewParams,
  applyViewParams,
  buildViewParams,
  getLastViewFromStorage,
  saveLastViewToStorage,
  type ViewState,
} from "./utils/urlParams";
import { useHiddenPublishers } from "./hooks/useHiddenPublishers";
import { useHiddenSeries } from "./hooks/useHiddenSeries";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { useHuntLists } from "./hooks/useHuntLists";
import { getFavoriteSeries } from "./utils/db";
import { syncCollectionToIndexedDB } from "./utils/offlineFullSync";
import {
  getAutoHidePublishersApplied,
  getAutoHideSeriesApplied,
  setAutoHidePublishersApplied,
  setAutoHideSeriesApplied,
} from "./utils/autoHideCollectedFlags";

const ThemedAppWithLoading: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [favoriteSeries, setFavoriteSeries] = useState<FavoriteSeries[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global filter state (used by all components)
  const [filter, setFilter] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [filterType, setFilterType] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterMinValue, setFilterMinValue] = useState("");
  const [filterMaxValue, setFilterMaxValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("series");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedSeries, setSelectedSeries] = useState<{
    publisher: string;
    series: string;
    volume?: string;
  } | null>(null);
  const [seriesPage, setSeriesPage] = useState(1);
  const [selectedHuntList, setSelectedHuntList] = useState<HuntListDetail | null>(null);
  const [isHuntListModalOpen, setIsHuntListModalOpen] = useState(false);
  const [huntListModalMode, setHuntListModalMode] = useState<"open" | "add">("open");
  const [pendingHuntSeries, setPendingHuntSeries] = useState<{
    publisher: string;
    series: string;
    volume: string;
  } | null>(null);
  const [newHuntListName, setNewHuntListName] = useState("");
  const [autoHideActions, setAutoHideActions] = useState<{
    hideCollectedPublishers: () => Promise<void>;
    hideCollectedSeries: () => Promise<void>;
  } | null>(null);
  const [autoHidePubActive, setAutoHidePubActive] = useState(
    getAutoHidePublishersApplied
  );
  const [autoHideSerActive, setAutoHideSerActive] = useState(
    getAutoHideSeriesApplied
  );

  const handleAutoHideCollectedOutcome = useCallback(
    (kind: "publishers" | "series", count: number) => {
      const applied = count > 0;
      if (kind === "publishers") {
        setAutoHidePublishersApplied(applied);
        setAutoHidePubActive(applied);
      } else {
        setAutoHideSeriesApplied(applied);
        setAutoHideSerActive(applied);
      }
    },
    []
  );

  const {
    hiddenSet,
    showHidden: showHiddenPublishers,
    setShowHidden: setShowHiddenPublishers,
    hidePublisher,
    unhidePublisher,
    refresh: refreshHiddenPublishers,
  } = useHiddenPublishers();
  const {
    hiddenSet: hiddenSeriesSet,
    showHidden: showHiddenSeries,
    setShowHidden: setShowHiddenSeries,
    hideSeries,
    unhideSeries,
    refresh: refreshHiddenSeries,
  } = useHiddenSeries();

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const skipFirstSyncRun = useRef(true);

  // Use loading manager
  const { setLoadingPhase } = useLoadingManager();

  const {
    isSyncing,
    error: offlineSyncError,
    lastSyncedAt,
    syncNow,
  } = useOfflineSync();
  const {
    lists: huntLists,
    createList,
    renameList,
    deleteList,
    getListDetail,
    addSeriesToList,
  } = useHuntLists();

  // Restore view from URL on mount, or from localStorage when URL has no params
  useEffect(() => {
    const search = window.location.search;
    if (!search || search === "?") {
      const last = getLastViewFromStorage();
      if (last) {
        setFilter(last.filter);
        setFilterOption(last.filterOption);
        setSortBy(last.sortBy);
        setItemsPerPage(last.itemsPerPage);
        setSelectedSeries(last.selectedSeries);
        setSelectedHuntList(null);
        setSeriesPage(last.page ?? 1);
        return;
      }
    }
    const parsed = parseViewParams(search);
    const applied = applyViewParams(parsed);
    setFilter(applied.filter ?? "");
    setFilterOption(applied.filterOption ?? "all");
    setSortBy(applied.sortBy ?? "series");
    setItemsPerPage(applied.itemsPerPage ?? 25);
    setSelectedSeries(applied.selectedSeries ?? null);
    setSelectedHuntList(null);
    setSeriesPage(applied.page ?? 1);
  }, []);

  // Sync view state to URL (replaceState to avoid crowding history). Skip first run so we don't overwrite URL before restore applies.
  useEffect(() => {
    if (skipFirstSyncRun.current) {
      skipFirstSyncRun.current = false;
      return;
    }
    const state: ViewState = {
      selectedSeries,
      page: seriesPage,
      filter,
      filterOption,
      sortBy,
      itemsPerPage,
    };
    saveLastViewToStorage(state);
    const search = buildViewParams(state);
    const url = `${window.location.pathname}${search}`;
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [selectedSeries, seriesPage, filter, filterOption, sortBy, itemsPerPage]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingPhase("data-loading");
        logger.info("Loading initial app data");

        // Only load favorites and global settings - components will load their own comic data
        let favoritesResponse: FavoriteSeries[];
        try {
          favoritesResponse = await apiService.favorites.getAll();
        } catch (apiErr) {
          const fromIdb = await getFavoriteSeries();
          if (fromIdb.length > 0) {
            logger.info(
              "Favorites loaded from offline sync (API unavailable)",
              {
                count: fromIdb.length,
              },
            );
            favoritesResponse = fromIdb;
          } else {
            throw apiErr;
          }
        }

        logger.info("Favorites loaded successfully", {
          count: favoritesResponse.length,
        });

        setFavoriteSeries(favoritesResponse);
        setError(null);

        // Move to ready state
        setTimeout(() => {
          setLoadingPhase("ready");
          setHasInitiallyLoaded(true);
        }, 300);
      } catch (err: any) {
        logger.error("Failed to load initial app data", err);
        setError("Failed to load app data. Please try again later.");
        setLoadingPhase("ready");
        setHasInitiallyLoaded(true);
      }
    };

    fetchInitialData();
  }, [setLoadingPhase]);

  const handleImport = async (): Promise<void> => {
    try {
      setIsRefreshing(true);
      setImportStatus("Import complete! Refreshing data...");

      // Use background-refresh phase for imports after initial load
      if (hasInitiallyLoaded) {
        setLoadingPhase("background-refresh");
      }

      logger.import.info("Import completed, data will refresh automatically");

      setError(null);
      setImportStatus("Complete! ✅");

      // Return to ready state
      if (hasInitiallyLoaded) {
        setTimeout(() => setLoadingPhase("ready"), 500);
      }
    } catch (err: any) {
      logger.import.error("Failed to handle import", err);
      setError("Import completed but refresh failed. Please reload the page.");
      setImportStatus("Error ❌");
      if (hasInitiallyLoaded) {
        setLoadingPhase("ready");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFavoriteSeries = async (
    publisher: string,
    series: string,
    volume: string,
  ) => {
    try {
      const existingFavorite = favoriteSeries.find(
        (fav) =>
          fav.publisher === publisher &&
          fav.series === series &&
          fav.volume === volume,
      );

      if (existingFavorite) {
        await apiService.favorites.remove(existingFavorite.id);
        setFavoriteSeries((prev) =>
          prev.filter((fav) => fav.id !== existingFavorite.id),
        );
      } else {
        const newFavorite = await apiService.favorites.add({
          publisher,
          series,
          volume,
        });
        setFavoriteSeries((prev) => [...prev, newFavorite]);
      }
    } catch (err: any) {
      logger.error("Failed to update favorite series", err);
      setError("Failed to update favorite series. Please try again.");
    }
  };

  // UI handlers
  const toggleFilterModal = () => {
    setIsFilterModalOpen(!isFilterModalOpen);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isFilterModalOpen) {
      setIsFilterModalOpen(false);
    }
  };

  const handleClearFilters = () => {
    setFilter("");
    setFilterOption("all");
    setFilterType("");
    setFilterGrade("");
    setFilterMinValue("");
    setFilterMaxValue("");
  };

  const openHuntListModal = (
    mode: "open" | "add",
    pending?: { publisher: string; series: string; volume: string }
  ) => {
    setHuntListModalMode(mode);
    setPendingHuntSeries(pending ?? null);
    setIsHuntListModalOpen(true);
  };

  const closeHuntListModal = () => {
    setIsHuntListModalOpen(false);
    setPendingHuntSeries(null);
    setNewHuntListName("");
  };

  const handleCreateHuntList = async () => {
    const name = newHuntListName.trim();
    if (!name) return;
    try {
      const created = await createList(name);
      setNewHuntListName("");
      if (huntListModalMode === "open") {
        const detail = await getListDetail(created.id);
        setSelectedSeries(null);
        setSelectedHuntList(detail);
        setSeriesPage(1);
        closeHuntListModal();
      } else if (pendingHuntSeries) {
        const detail = await addSeriesToList(created.id, pendingHuntSeries);
        if (selectedHuntList?.id === detail.id) setSelectedHuntList(detail);
        closeHuntListModal();
      }
    } catch (err: any) {
      setError(`Failed to create hunt list: ${err?.message ?? "Unknown error"}`);
    }
  };

  const handleSelectHuntList = async (listId: string) => {
    try {
      if (huntListModalMode === "open") {
        const detail = await getListDetail(listId);
        setSelectedSeries(null);
        setSelectedHuntList(detail);
        setSeriesPage(1);
      } else if (pendingHuntSeries) {
        const detail = await addSeriesToList(listId, pendingHuntSeries);
        if (selectedHuntList?.id === detail.id) setSelectedHuntList(detail);
      }
      closeHuntListModal();
    } catch (err: any) {
      setError(`Failed to use hunt list: ${err?.message ?? "Unknown error"}`);
    }
  };

  const handleOpenMultiHunt = async () => {
    openHuntListModal("open");
  };

  const handleAddToHuntList = async (
    publisher: string,
    series: string,
    volume: string
  ) => {
    openHuntListModal("add", { publisher, series, volume });
  };

  const handleRemoveFromHuntList = async (item: {
    publisher: string;
    series: string;
    volume?: string;
  }) => {
    if (!selectedHuntList) return;
    const updated = await apiService.huntLists.removeSeries(selectedHuntList.id, item);
    setSelectedHuntList(updated);
  };

  const handleRenameHuntList = async (id: string, currentName: string) => {
    const next = window.prompt("Rename hunt list", currentName);
    if (next == null || !next.trim()) return;
    try {
      const updated = await renameList(id, next.trim());
      if (selectedHuntList?.id === id) {
        setSelectedHuntList({ ...selectedHuntList, name: updated.name });
      }
    } catch (err: any) {
      setError(`Failed to rename hunt list: ${err?.message ?? "Unknown error"}`);
    }
  };

  const handleDeleteHuntList = async (id: string, name: string) => {
    const ok = window.confirm(`Delete hunt list "${name}"?`);
    if (!ok) return;
    try {
      await deleteList(id);
      if (selectedHuntList?.id === id) {
        setSelectedHuntList(null);
      }
    } catch (err: any) {
      setError(`Failed to delete hunt list: ${err?.message ?? "Unknown error"}`);
    }
  };

  const openImportModal = () => {
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportStatus("");
  };

  const renderGeneralError = () => {
    if (!error) return null;

    return (
      <S.FloatingErrorContainer>
        <ErrorMessage
          message={error}
          type="error"
          onDismiss={() => setError(null)}
        />
      </S.FloatingErrorContainer>
    );
  };

  const renderRefreshIndicator = () => {
    if (!isRefreshing) return null;

    return (
      <S.RefreshIndicatorContainer>
        <S.RefreshIndicatorInner />
        Updating data...
      </S.RefreshIndicatorContainer>
    );
  };

  return (
    <ComicActionsErrorBoundary
      onError={(error, errorInfo) => {
        logger.error("Application crashed", { error, errorInfo });
        setError(
          `Application error: ${error.message}. Please refresh the page.`,
        );
      }}
    >
      <S.AppContainer data-sc="AppContainer">
        {!isOnline && (
          <S.OfflineBanner>
            You&apos;re offline. Showing cached data where available.
          </S.OfflineBanner>
        )}
        <S.HeaderContainer data-sc="S.HeaderContainer">
          <Header
            onFilterClick={toggleFilterModal}
            onMenuClick={toggleMenu}
            isFilterOpen={isFilterModalOpen}
          />
          <FilterSort
            filter={filter}
            setFilter={setFilter}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            sortBy={sortBy}
            setSortBy={setSortBy}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            filterType={filterType}
            setFilterType={setFilterType}
            filterGrade={filterGrade}
            setFilterGrade={setFilterGrade}
            filterMinValue={filterMinValue}
            setFilterMinValue={setFilterMinValue}
            filterMaxValue={filterMaxValue}
            setFilterMaxValue={setFilterMaxValue}
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onClearAllFilters={handleClearFilters}
            onOpenMultiHunt={handleOpenMultiHunt}
            activeHuntListName={selectedHuntList?.name ?? null}
          />
        </S.HeaderContainer>

        {renderGeneralError()}

        <ComicList
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          filterOption={filterOption}
          searchFilter={filter}
          filterType={filterType}
          filterGrade={filterGrade}
          filterMinValue={filterMinValue}
          filterMaxValue={filterMaxValue}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          favoriteSeries={favoriteSeries}
          onToggleFavoriteSeries={handleToggleFavoriteSeries}
          selectedSeries={selectedSeries}
          seriesPage={seriesPage}
          setSeriesPage={setSeriesPage}
          onOpenDetailView={(publisher, series, volume) => {
            setSeriesPage(1);
            setSelectedHuntList(null);
            setSelectedSeries({ publisher, series, volume });
          }}
          onBackToGrid={() => {
            setSelectedSeries(null);
            setSelectedHuntList(null);
          }}
          hiddenPublishersSet={hiddenSet}
          showHiddenPublishers={showHiddenPublishers}
          onHidePublisher={hidePublisher}
          onUnhidePublisher={unhidePublisher}
          hiddenSeriesSet={hiddenSeriesSet}
          showHiddenSeries={showHiddenSeries}
          onHideSeries={hideSeries}
          onUnhideSeries={unhideSeries}
          onAddToHuntList={handleAddToHuntList}
          selectedHuntList={selectedHuntList}
          onBackFromMultiHunt={() => setSelectedHuntList(null)}
          onRemoveFromHuntList={handleRemoveFromHuntList}
          onAutoHideActionsReady={setAutoHideActions}
          onAutoHideCollectedOutcome={handleAutoHideCollectedOutcome}
          refreshHiddenPublishers={refreshHiddenPublishers}
          refreshHiddenSeries={refreshHiddenSeries}
        />

        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onImport={handleImport}
          onOpenImportModal={openImportModal}
          importStatus={importStatus}
          onSyncOffline={syncNow}
          isSyncingOffline={isSyncing}
          lastSyncedAt={lastSyncedAt}
          offlineSyncError={offlineSyncError}
          showHiddenPublishers={showHiddenPublishers}
          onShowHiddenPublishersChange={setShowHiddenPublishers}
          showHiddenSeries={showHiddenSeries}
          onShowHiddenSeriesChange={setShowHiddenSeries}
          autoHidePublishersActive={autoHidePubActive}
          autoHideSeriesActive={autoHideSerActive}
          onHideCollectedPublishers={
            autoHideActions
              ? () => {
                  autoHideActions.hideCollectedPublishers().catch((err) =>
                    logger.warn("Hide collected publishers failed", err),
                  );
                }
              : undefined
          }
          onHideCollectedSeries={
            autoHideActions
              ? () => {
                  autoHideActions.hideCollectedSeries().catch((err) =>
                    logger.warn("Hide collected series failed", err),
                  );
                }
              : undefined
          }
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={closeImportModal}
          onImport={handleImport}
          afterSuccessfulImport={async () => {
            try {
              await syncCollectionToIndexedDB();
            } catch (err: unknown) {
              logger.comics.error("Post-import offline sync failed", err);
              window.dispatchEvent(
                new CustomEvent("comictracker-offline-sync-failed", {
                  detail: {
                    message:
                      err instanceof Error
                        ? err.message
                        : "Could not refresh offline copy after import. Use Sync in the menu.",
                  },
                }),
              );
            }
          }}
        />

        <Modal
          isOpen={isHuntListModalOpen}
          onClose={closeHuntListModal}
          title={huntListModalMode === "open" ? "Open Multi-Hunt" : "Add to Hunt List"}
          size="medium"
        >
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              placeholder="New hunt list name"
              value={newHuntListName}
              onChange={(e) => setNewHuntListName(e.target.value)}
              style={{ flex: 1, padding: "0.55rem 0.7rem", borderRadius: 8, border: "1px solid #666" }}
            />
            <Button onClick={handleCreateHuntList} variant="primary" size="small">
              Create
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {huntLists.map((list) => (
              <div
                key={list.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: "0.45rem 0.55rem",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{list.name}</div>
                  <div style={{ opacity: 0.8, fontSize: "0.85rem" }}>
                    {list.seriesCount} series
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <Button
                    onClick={() => handleSelectHuntList(list.id)}
                    variant="primary"
                    size="small"
                  >
                    {huntListModalMode === "open" ? "Open" : "Add"}
                  </Button>
                  <Button
                    onClick={() => handleRenameHuntList(list.id, list.name)}
                    variant="secondary"
                    size="small"
                  >
                    Rename
                  </Button>
                  <Button
                    onClick={() => handleDeleteHuntList(list.id, list.name)}
                    variant="tertiary"
                    size="small"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {huntLists.length === 0 && (
              <div style={{ opacity: 0.8 }}>No hunt lists yet. Create one above.</div>
            )}
          </div>
        </Modal>

        {renderRefreshIndicator()}

        {/* Loading spinner overlays everything when active */}
        <ComicLoadingSpinner />
      </S.AppContainer>
    </ComicActionsErrorBoundary>
  );
};

// Keep the rest of the component structure the same
const ThemeWrapper: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ThemedAppWithLoading />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <LoadingManagerProvider>
        <ThemeWrapper />
      </LoadingManagerProvider>
    </CustomThemeProvider>
  );
};

export default App;

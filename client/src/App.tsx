import React, { useState, useEffect, useRef } from "react";
import { FilterOption, FavoriteSeries, SortOption } from "./types";
import ComicActionsErrorBoundary from "./components/shared/ComicActionErrorBoundary";
import ErrorMessage from "./components/shared/ErrorMessage";
import ImportModal from "./components/ImportModal";
import Header from "./components/Header/index.ts";
import FilterSort from "./components/FilterSort/index.ts";
import ComicList from "./components/ComicList/index.ts";
import HamburgerMenu from "./components/HamburgerMenu/index.ts";
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

  const { hiddenSet, showHidden: showHiddenPublishers, setShowHidden: setShowHiddenPublishers, hidePublisher, unhidePublisher } = useHiddenPublishers();
  const { hiddenSet: hiddenSeriesSet, showHidden: showHiddenSeries, setShowHidden: setShowHiddenSeries, hideSeries, unhideSeries } = useHiddenSeries();

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const skipFirstSyncRun = useRef(true);

  // Use loading manager
  const { setLoadingPhase } = useLoadingManager();

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
        const favoritesResponse = await apiService.favorites.getAll();

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

  if (!isOnline) {
    return (
      <div>You are currently offline. Some features may be unavailable.</div>
    );
  }

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
    volume: string
  ) => {
    try {
      const existingFavorite = favoriteSeries.find(
        (fav) =>
          fav.publisher === publisher &&
          fav.series === series &&
          fav.volume === volume
      );

      if (existingFavorite) {
        await apiService.favorites.remove(existingFavorite.id);
        setFavoriteSeries((prev) =>
          prev.filter((fav) => fav.id !== existingFavorite.id)
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
          `Application error: ${error.message}. Please refresh the page.`
        );
      }}
    >
      <S.AppContainer data-sc="AppContainer">
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
            showHiddenPublishers={showHiddenPublishers}
            onShowHiddenPublishersChange={setShowHiddenPublishers}
            showHiddenSeries={showHiddenSeries}
            onShowHiddenSeriesChange={setShowHiddenSeries}
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            isDetailView={selectedSeries != null}
            onClearAllFilters={handleClearFilters}
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
            setSelectedSeries({ publisher, series, volume });
          }}
          onBackToGrid={() => setSelectedSeries(null)}
          hiddenPublishersSet={hiddenSet}
          showHiddenPublishers={showHiddenPublishers}
          onHidePublisher={hidePublisher}
          onUnhidePublisher={unhidePublisher}
          hiddenSeriesSet={hiddenSeriesSet}
          showHiddenSeries={showHiddenSeries}
          onHideSeries={hideSeries}
          onUnhideSeries={unhideSeries}
        />

        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onImport={handleImport}
          onOpenImportModal={openImportModal}
          importStatus={importStatus}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={closeImportModal}
          onImport={handleImport}
        />

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

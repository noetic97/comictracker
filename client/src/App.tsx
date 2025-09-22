import React, { useState, useEffect } from "react";
import { SortOption, FilterOption, FavoriteSeries } from "./types";
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

const ThemedAppWithLoading: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [favoriteSeries, setFavoriteSeries] = useState<FavoriteSeries[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global filter/sort state (used by all components)
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("series");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [hideCollected, setHideCollected] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Use loading manager
  const { setLoadingPhase } = useLoadingManager();

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
          <Header onFilterClick={toggleFilterModal} onMenuClick={toggleMenu} />
          <FilterSort
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            hideCollected={hideCollected}
            setHideCollected={setHideCollected}
          />
        </S.HeaderContainer>

        {renderGeneralError()}

        <ComicList
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          filterOption={filterOption}
          favoriteSeries={favoriteSeries}
          onToggleFavoriteSeries={handleToggleFavoriteSeries}
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

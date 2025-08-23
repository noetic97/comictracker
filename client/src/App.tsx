import React, { useState, useEffect, lazy, Suspense } from "react";
import { Comic, SortOption, FilterOption, FavoriteSeries } from "./types.ts";
import { useComicActions } from "./hooks/useComicActions";
import ComicActionsErrorBoundary from "./components/shared/ComicActionErrorBoundary";
import ErrorMessage from "./components/shared/ErrorMessage";
import ImportModal from "./components/ImportModal";
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

const Header = lazy(() => import("./components/Header/index.ts"));
const FilterSort = lazy(() => import("./components/FilterSort/index.ts"));
const ComicList = lazy(() => import("./components/ComicList/index.ts"));
const HamburgerMenu = lazy(() => import("./components/HamburgerMenu/index.ts"));

const ThemedAppWithLoading: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [comics, setComics] = useState<Comic[]>([]);
  const [favoriteSeries, setFavoriteSeries] = useState<FavoriteSeries[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("series");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [hideCollected, setHideCollected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");

  // Add state to track if we've finished initial loading
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

  if (!isOnline) {
    return (
      <div>You are currently offline. Some features may be unavailable.</div>
    );
  }

  const comicActions = useComicActions({
    onComicUpdated: (updatedComic) => {
      console.log(`📝 Comic updated in UI:`, updatedComic);
      setComics((prevComics) =>
        prevComics.map((c) => (c.id === updatedComic.id ? updatedComic : c))
      );
    },
    onError: (error, comic) => {
      console.error(
        `❌ Comic action error for ${comic.series} #${comic.issue}:`,
        error
      );
      setError(`Failed to update ${comic.series} #${comic.issue}: ${error}`);
    },
    optimisticUpdates: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingPhase("data-loading");
        console.log("🔄 Loading all comics and favorites...");

        const [comicsResponse, favoritesResponse] = await Promise.all([
          apiService.comics.getAll(),
          apiService.favorites.getAll(),
        ]);

        console.log(
          `✅ Loaded ${comicsResponse.comics.length} comics and ${favoritesResponse.length} favorites`
        );

        setComics(comicsResponse.comics);
        setFavoriteSeries(favoritesResponse);
        setError(null);

        // FIXED: Go directly to ready after data loads
        // Let the lazy components handle their own loading without affecting main loading state
        setTimeout(() => {
          setLoadingPhase("ready");
          setHasInitiallyLoaded(true);
        }, 300); // Short delay to let state settle
      } catch (err: any) {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try again later.");
        setLoadingPhase("ready");
        setHasInitiallyLoaded(true);
      }
    };

    fetchData();
  }, [setLoadingPhase]);

  useEffect(() => {
    const filtered = comics.filter(
      (comic) =>
        (comic.series.toLowerCase().includes(filter.toLowerCase()) ||
          comic.publisher.toLowerCase().includes(filter.toLowerCase())) &&
        (!hideCollected || !comic.collected)
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "issueNumber") {
        return (a.issueNumber || 0) - (b.issueNumber || 0);
      } else if (sortBy === "currentValue") {
        return (a.currentValue || 0) - (b.currentValue || 0);
      } else {
        return (a[sortBy] as string).localeCompare(b[sortBy] as string);
      }
    });

    setFilteredComics(sorted);
  }, [comics, filter, sortBy, hideCollected]);

  const handleCollect = async (id: string) => {
    const comic = comics.find((c) => c.id === id);
    if (!comic) {
      console.error("Comic not found:", id);
      setError("Comic not found");
      return;
    }

    try {
      await comicActions.handleCollectedToggle(comic);
    } catch (error: any) {
      console.error("Collect toggle failed:", error);
    }
  };

  const handleToggleGrail = async (id: string) => {
    const comic = comics.find((c) => c.id === id);
    if (!comic) {
      console.error("Comic not found:", id);
      setError("Comic not found");
      return;
    }

    try {
      await comicActions.handleGrailToggle(comic);
    } catch (error: any) {
      console.error("Grail toggle failed:", error);
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
      console.error("Failed to update favorite series:", err);
      setError("Failed to update favorite series. Please try again.");
    }
  };

  const handleImport = async (_importedComics: Comic[]): Promise<void> => {
    try {
      setIsRefreshing(true);
      setImportStatus("Refreshing...");

      // Use background-refresh phase for imports after initial load
      if (hasInitiallyLoaded) {
        setLoadingPhase("background-refresh");
      }

      console.log("🔄 Refreshing comics list after import...");

      const comicsResponse = await apiService.comics.getAll();
      setComics(comicsResponse.comics);

      console.log(
        `✅ Refreshed: Now showing ${comicsResponse.comics.length} total comics`
      );
      setError(null);
      setImportStatus("Complete! ✅");

      // Return to ready state
      if (hasInitiallyLoaded) {
        setTimeout(() => setLoadingPhase("ready"), 500);
      }
    } catch (err: any) {
      console.error("Failed to refresh comics after import:", err);
      setError("Failed to refresh comics. Please reload the page.");
      setImportStatus("Error ❌");
      if (hasInitiallyLoaded) {
        setLoadingPhase("ready");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // All the handler functions remain the same...
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

  const renderComicActionErrors = () => {
    if (!comicActions.hasErrors) return null;

    const errors = comicActions.getAllErrors();
    const errorMessage = `Comic update errors: ${errors
      .map(([id, error]) => error)
      .join(", ")}`;

    return (
      <S.FloatingErrorContainer>
        <ErrorMessage
          message={errorMessage}
          type="error"
          onDismiss={comicActions.clearErrors}
        />
      </S.FloatingErrorContainer>
    );
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

  const renderActionStatus = () => {
    if (comicActions.isUpdating && comicActions.lastOperation) {
      return (
        <S.FloatingStatusMessage>
          🔄 {comicActions.lastOperation}
        </S.FloatingStatusMessage>
      );
    }
    return null;
  };

  const renderRefreshIndicator = () => {
    if (!isRefreshing) return null;

    return (
      <S.RefreshIndicatorContainer>
        <S.RefreshIndicatorInner />
        Updating comic list...
      </S.RefreshIndicatorContainer>
    );
  };

  // Invisible fallback for lazy loading - doesn't trigger loading states
  const LazyFallback = () => null;

  // Always render app content - ComicLoadingSpinner overlays when needed
  return (
    <ComicActionsErrorBoundary
      onError={(error, errorInfo) => {
        console.error("🚨 Comic Actions crashed:", error, errorInfo);
        setError(
          `Application error: ${error.message}. Please refresh the page.`
        );
      }}
    >
      <S.AppContainer data-sc="AppContainer">
        <Suspense fallback={<LazyFallback />}>
          <S.HeaderContainer data-sc="S.HeaderContainer">
            <Header
              onFilterClick={toggleFilterModal}
              onMenuClick={toggleMenu}
            />
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

          {renderActionStatus()}
          {renderComicActionErrors()}
          {renderGeneralError()}

          <ComicList
            comics={filteredComics}
            onCollect={handleCollect}
            onToggleGrail={handleToggleGrail}
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
        </Suspense>

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

import React, { useState, useEffect, lazy, Suspense } from "react";
import { Comic, SortOption, FilterOption, FavoriteSeries } from "./types.ts";
import { useComicActions } from "./hooks/useComicActions";
import ComicActionsErrorBoundary from "./components/shared/ComicActionErrorBoundary";
import ErrorMessage from "./components/shared/ErrorMessage";
import { AppContainer, HeaderContainer } from "./styles";
import { apiService } from "./utils/apiService"; // Changed from db imports
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "./themes/ThemeContext.tsx";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "./GlobalStyles.ts";

const Header = lazy(() => import("./components/Header/index.ts"));
const FilterSort = lazy(() => import("./components/FilterSort/index.ts"));
const ComicList = lazy(() => import("./components/ComicList/index.ts"));
const HamburgerMenu = lazy(() => import("./components/HamburgerMenu/index.ts"));

const ThemedApp: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [comics, setComics] = useState<Comic[]>([]);
  const [favoriteSeries, setFavoriteSeries] = useState<FavoriteSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("series");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [hideCollected, setHideCollected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);

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
    optimisticUpdates: true, // Enable optimistic updates for better UX
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Loading all comics and favorites...");

        const [comicsResponse, favoritesResponse] = await Promise.all([
          apiService.comics.getAll(), // Remove the { limit: 1000 } parameter to get ALL comics
          apiService.favorites.getAll(),
        ]);

        console.log(
          `✅ Loaded ${comicsResponse.comics.length} comics and ${favoritesResponse.length} favorites`
        );

        setComics(comicsResponse.comics);
        setFavoriteSeries(favoritesResponse);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = comics.filter(
      (comic) =>
        (comic.series.toLowerCase().includes(filter.toLowerCase()) ||
          comic.publisher.toLowerCase().includes(filter.toLowerCase())) &&
        (!hideCollected || !comic.collected)
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "issueNumber") {
        return a.issueNumber - b.issueNumber;
      } else if (sortBy === "currentValue") {
        return a.currentValue - b.currentValue;
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

    console.log(
      `🔄 Handling collect toggle for ${comic.series} #${comic.issue}`
    );

    try {
      await comicActions.handleCollectedToggle(comic);
      // Success is handled by the onComicUpdated callback
    } catch (error: any) {
      console.error("Collect toggle failed:", error);
      // Error is handled by the onError callback
    }
  };

  const handleToggleGrail = async (id: string) => {
    const comic = comics.find((c) => c.id === id);
    if (!comic) {
      console.error("Comic not found:", id);
      setError("Comic not found");
      return;
    }

    console.log(`⭐ Handling grail toggle for ${comic.series} #${comic.issue}`);

    try {
      await comicActions.handleGrailToggle(comic);
      // Success is handled by the onComicUpdated callback
    } catch (error: any) {
      console.error("Grail toggle failed:", error);
      // Error is handled by the onError callback
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

  const handleImport = async (importedComics: Comic[]): Promise<void> => {
    try {
      setIsLoading(true);

      // The actual import is now handled by the ImportCSV component
      // This is just called to refresh the UI after import
      console.log("🔄 Refreshing comics list after import...");

      const comicsResponse = await apiService.comics.getAll(); // Remove { limit: 1000 }
      setComics(comicsResponse.comics);

      console.log(
        `✅ Refreshed: Now showing ${comicsResponse.comics.length} total comics`
      );
      setError(null);
    } catch (err: any) {
      console.error("Failed to refresh comics after import:", err);
      setError("Failed to refresh comics. Please reload the page.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Remove sync function since we're using API now
  // const syncChanges = async () => { ... }

  // Add error display for comic actions
  const renderComicActionErrors = () => {
    if (!comicActions.hasErrors) return null;

    const errors = comicActions.getAllErrors();
    const errorMessage = `Comic update errors: ${errors
      .map(([id, error]) => error)
      .join(", ")}`;

    return (
      <ErrorMessage
        message={errorMessage}
        type="error"
        onDismiss={comicActions.clearErrors}
      />
    );
  };

  // Show loading state or status
  const renderActionStatus = () => {
    if (comicActions.isUpdating && comicActions.lastOperation) {
      return (
        <div
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(66, 165, 245, 0.1)",
            borderRadius: "4px",
            margin: "0.5rem 0",
            fontSize: "0.9rem",
            color: "#1976d2",
          }}
        >
          🔄 {comicActions.lastOperation}
        </div>
      );
    }
    return null;
  };

  if (isLoading) return <div>Loading comics...</div>;
  if (error) return <div>{error}</div>;

  const LoadingSpinner = () => <div>Loading...</div>;

  return (
    <ComicActionsErrorBoundary
      onError={(error, errorInfo) => {
        console.error("🚨 Comic Actions crashed:", error, errorInfo);
        setError(
          `Application error: ${error.message}. Please refresh the page.`
        );
      }}
    >
      <AppContainer data-sc="AppContainer">
        <Suspense fallback={<LoadingSpinner />}>
          <HeaderContainer data-sc="HeaderContainer">
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
          </HeaderContainer>

          {/* Show action status and errors */}
          {renderActionStatus()}
          {renderComicActionErrors()}

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
          />
        </Suspense>
      </AppContainer>
    </ComicActionsErrorBoundary>
  );
};

const ThemeWrapper: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ThemedApp />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <ThemeWrapper />
    </CustomThemeProvider>
  );
};

export default App;

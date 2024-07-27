import React, { useState, useEffect, lazy, Suspense } from "react";
import { Comic, SortOption } from "./types.ts";
import { AppContainer, HeaderContainer } from "./styles";
import { getComics, addComics, updateComic, syncComics } from "./utils/db";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "./themes/ThemeContext";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "./GlobalStyles";

const Header = lazy(() => import("./components/Header"));
const FilterSort = lazy(() => import("./components/FilterSort"));
const ComicList = lazy(() => import("./components/ComicList"));
const HamburgerMenu = lazy(() => import("./components/HamburgerMenu"));

const ThemedApp: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [comics, setComics] = useState<Comic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("series");
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

  useEffect(() => {
    const fetchComics = async () => {
      try {
        setIsLoading(true);
        const fetchedComics = await getComics();
        setComics(fetchedComics);
        setError(null);
      } catch (err) {
        setError("Failed to load comics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComics();
  }, []);

  useEffect(() => {
    const filtered =
      comics &&
      comics.filter(
        (comic) =>
          (comic.series.toLowerCase().includes(filter.toLowerCase()) ||
            comic.publisher.toLowerCase().includes(filter.toLowerCase())) &&
          (!hideCollected || !comic.collected)
      );

    const sorted =
      filtered &&
      [...filtered].sort((a, b) => {
        if (sortBy === "issueNumber") {
          return a.issueNumber - b.issueNumber;
        } else if (sortBy === "currentValue") {
          return a.currentValue - b.currentValue;
        } else {
          return (a[sortBy] as string).localeCompare(b[sortBy] as string);
        }
      });

    setFilteredComics(sorted || []);
  }, [comics, filter, sortBy, hideCollected]);

  const handleCollect = async (id: string) => {
    try {
      const comic = comics.find((c) => c.id === id);
      if (comic) {
        const updatedComic = { ...comic, collected: !comic.collected };
        await updateComic(updatedComic);
        setComics((prevComics) =>
          prevComics.map((c) => (c.id === id ? updatedComic : c))
        );
      }
    } catch (err) {
      setError("Failed to update comic. Please try again.");
    }
  };

  const handleImport = async (importedComics: Comic[]): Promise<void> => {
    try {
      const addedOrUpdatedComics = await addComics(importedComics);

      setComics((prevComics) => {
        const newComics = [...prevComics];
        let newComicsCount = 0;
        let updatedComicsCount = 0;

        addedOrUpdatedComics.forEach((comic) => {
          const index = newComics.findIndex((c) => c.id === comic.id);
          if (index !== -1) {
            // Update existing comic, but keep the collected state from the current state
            newComics[index] = {
              ...comic,
              collected: newComics[index].collected, // Preserve the existing collected state
            };
            updatedComicsCount++;
          } else {
            newComics.push(comic); // Add new comic
            newComicsCount++;
          }
        });

        console.log(
          `Import complete: ${newComicsCount} new comics added, ${updatedComicsCount} comics updated.`
        );
        return newComics;
      });
    } catch (err) {
      setError("Failed to import comics. Please try again.");
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

  // Function to sync changes when coming back online
  const syncChanges = async () => {
    try {
      await syncComics(comics);
      setError(null);
    } catch (err) {
      setError("Failed to sync changes. Some updates may not be saved.");
    }
  };

  useEffect(() => {
    window.addEventListener("online", syncChanges);
    return () => window.removeEventListener("online", syncChanges);
  }, [comics]);

  if (isLoading) return <div>Loading comics...</div>;
  if (error) return <div>{error}</div>;

  const LoadingSpinner = () => <div>Loading...</div>;

  return (
    <AppContainer data-sc="AppContainer">
      <Suspense fallback={<LoadingSpinner />}>
        <HeaderContainer data-sc="HeaderContainer">
          <Header onFilterClick={toggleFilterModal} onMenuClick={toggleMenu} />
          <FilterSort
            filter={filter}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            hideCollected={hideCollected}
            setHideCollected={setHideCollected}
          />
        </HeaderContainer>
        <ComicList
          comics={filteredComics}
          onCollect={handleCollect}
          itemsPerPage={itemsPerPage}
        />
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onImport={handleImport}
        />
      </Suspense>
    </AppContainer>
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

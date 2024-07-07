import React, { useState, useEffect } from "react";
import { Comic } from "./types.ts";
import ComicList from "./components/ComicList";
import FilterSort from "./components/FilterSort";
import Header from "./components/Header";
import HamburgerMenu from "./components/HamburgerMenu";
import { AppContainer, HeaderContainer } from "./styles";
import { getComics, addComics, updateComic } from "./utils/db";

const App: React.FC = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof Comic>("series");
  const [hideCollected, setHideCollected] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    getComics().then(setComics);
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
    const comic = comics.find((c) => c.id === id);
    if (comic) {
      const updatedComic = { ...comic, collected: !comic.collected };
      await updateComic(updatedComic);
      setComics(comics.map((c) => (c.id === id ? updatedComic : c)));
    }
  };

  const handleImport = async (importedComics: Comic[]) => {
    const newComics = importedComics.filter(
      (importedComic) =>
        !comics.some(
          (existingComic) =>
            existingComic.publisher === importedComic.publisher &&
            existingComic.series === importedComic.series &&
            existingComic.issue === importedComic.issue
        )
    );
    await addComics(newComics);
    setComics((prevComics) => [...prevComics, ...newComics]);
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

  return (
    <AppContainer data-sc="AppContainer">
      <HeaderContainer data-sc="HeaderContainer">
        <Header onFilterClick={toggleFilterModal} onMenuClick={toggleMenu} />
        <FilterSort
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          hideCollected={hideCollected}
          setHideCollected={setHideCollected}
        />
      </HeaderContainer>
      <ComicList comics={filteredComics} onCollect={handleCollect} />
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onImport={handleImport}
      />
    </AppContainer>
  );
};

export default App;

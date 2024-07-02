import React, { useState, useEffect } from "react";
import { Comic } from "./types.ts";
import ComicList from "./components/ComicList.tsx";
import FilterSort from "./components/FilterSort.tsx";
import ImportCSV from "./components/ImportCSV.tsx";
import { Zap } from "lucide-react";
import { getComics, addComics, updateComic } from "./utils/db";

const App: React.FC = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filteredComics, setFilteredComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof Comic>("series");
  const [hideCollected, setHideCollected] = useState(false);

  useEffect(() => {
    getComics().then(setComics);
  }, []);

  useEffect(() => {
    const filtered =
      comics &&
      comics.filter(
        (comic) =>
          (comic?.series.toLowerCase().includes(filter.toLowerCase()) ||
            comic?.publisher.toLowerCase().includes(filter.toLowerCase())) &&
          (!hideCollected || !comic.collected)
      );

    const sorted = [...filtered].sort((a, b) =>
      a[sortBy] > b[sortBy] ? 1 : -1
    );

    setFilteredComics(sorted);
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

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-yellow-400 text-black p-2 rounded-full mr-4">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
            Comic Want List
          </h1>
        </div>
      </div>
      <ImportCSV onImport={handleImport} />
      <FilterSort
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hideCollected={hideCollected}
        setHideCollected={setHideCollected}
      />
      <ComicList comics={filteredComics} onCollect={handleCollect} />
    </div>
  );
};

export default App;

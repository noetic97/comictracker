import React, { useState } from "react";
import { Comic } from "../types";

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
}

interface GroupedComics {
  [key: string]: Comic[];
}

const ComicList: React.FC<Props> = ({ comics, onCollect }) => {
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);

  const groupedComics = comics.reduce((acc: GroupedComics, comic) => {
    const key = `${comic.publisher} - ${comic.series}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(comic);
    return acc;
  }, {});

  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) =>
      prev.includes(series)
        ? prev.filter((s) => s !== series)
        : [...prev, series]
    );
  };

  const expandAll = () => {
    setExpandedSeries(Object.keys(groupedComics));
  };

  const collapseAll = () => {
    setExpandedSeries([]);
  };

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={expandAll}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Collapse All
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedComics).map(([series, comicList]) => (
          <div key={series} className="border rounded shadow">
            <button
              className="w-full p-4 text-left font-bold bg-gray-100 hover:bg-gray-200 focus:outline-none"
              onClick={() => toggleSeries(series)}
            >
              {series} ({comicList.length} issues)
            </button>
            {expandedSeries.includes(series) && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comicList.map((comic) => (
                  <div key={comic.id} className="border p-4 rounded shadow">
                    <h3 className="text-lg font-semibold">
                      {comic.series} {comic.volume && `Vol. ${comic.volume}`} #
                      {comic.issue}
                    </h3>
                    <p>Years: {comic.years}</p>
                    <p>Current Value: ${comic.currentValue}</p>
                    <button
                      onClick={() => onCollect(comic.id)}
                      className={`mt-2 px-4 py-2 rounded ${
                        comic.collected ? "bg-green-500" : "bg-blue-500"
                      } text-white`}
                    >
                      {comic.collected ? "Collected" : "Mark as Collected"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicList;

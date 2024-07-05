import React, { useState } from "react";
import { Comic } from "../types";
import {
  CollectButton,
  ComicMeta,
  ComicTitle,
  ComicInfo,
  ComicValue,
  ComicItem,
  CardHeader,
  Card,
  StyledButton,
  ExpandContainer,
} from "../styles";

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
    const key = `${comic.series} - ${comic.volume}`;
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
      <ExpandContainer className="mb-4">
        <StyledButton onClick={expandAll}>Expand All</StyledButton>
        <StyledButton onClick={collapseAll}>Collapse All</StyledButton>
      </ExpandContainer>
      <div className="space-y-4">
        {Object.entries(groupedComics).map(([series, comicList]) => (
          <Card key={series} className="border rounded shadow">
            <CardHeader onClick={() => toggleSeries(series)}>
              {series} ({comicList.length} issues)
            </CardHeader>
            {expandedSeries.includes(series) && (
              <ComicItem>
                {comicList.map((comic) => (
                  <ComicInfo
                    key={comic.id}
                    className="border p-4 rounded shadow"
                  >
                    <ComicTitle>
                      {comic.series} {` - ${comic.volume} # `}
                      {comic.issue}
                    </ComicTitle>
                    <ComicMeta>Years: {comic.years}</ComicMeta>
                    <ComicValue>
                      Current Value: ${comic.currentValue}
                    </ComicValue>
                    <CollectButton
                      onClick={() => onCollect(comic.id)}
                      className={`mt-2 px-4 py-2 rounded ${
                        comic.collected ? "bg-green-500" : "bg-blue-500"
                      } text-white`}
                    >
                      {comic.collected ? "Collected" : "Mark as Collected"}
                    </CollectButton>
                  </ComicInfo>
                ))}
              </ComicItem>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComicList;

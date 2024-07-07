import React, { useState } from "react";
import { Comic } from "../../types";
import * as S from "./styles";

interface Props {
  comics: Comic[];
  onCollect: (id: string) => void;
}

interface GroupedComics {
  [key: string]: Comic[];
}

const ComicList: React.FC<Props> = ({ comics, onCollect }) => {
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const groupedComics = comics.reduce((acc: GroupedComics, comic) => {
    const key = `${comic.series} - ${comic.volume}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(comic);
    return acc;
  }, {});

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedSeries([]);
    } else {
      setExpandedSeries(Object.keys(groupedComics));
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) =>
      prev.includes(series)
        ? prev.filter((s) => s !== series)
        : [...prev, series]
    );
  };

  return (
    <S.ComicListContainer data-sc="ComicListContainer">
      <S.ExpandContainer data-sc="ExpandContainer">
        <S.ToggleButton onClick={toggleAll} data-sc="ToggleButton">
          {isAllExpanded ? "Collapse All" : "Expand All"}
        </S.ToggleButton>
      </S.ExpandContainer>
      {Object.entries(groupedComics).map(([series, comicList]) => (
        <S.SeriesCard key={series} data-sc="SeriesCard">
          <S.SeriesHeader
            onClick={() => toggleSeries(series)}
            data-sc="SeriesHeader"
          >
            {series} ({comicList.length} issues)
          </S.SeriesHeader>
          {expandedSeries.includes(series) && (
            <>
              {comicList.map((comic) => (
                <S.ComicItem
                  key={comic.id}
                  collected={comic.collected}
                  data-sc="ComicItem"
                >
                  <S.ComicInfo data-sc="ComicInfo">
                    <S.ComicTitle data-sc="ComicTitle">
                      {comic.series} {` - ${comic.volume && comic.volume} # `}
                      {comic.issue}
                    </S.ComicTitle>
                    <S.ComicMeta data-sc="ComicMeta">
                      Years: {comic.years}
                    </S.ComicMeta>
                    <S.ComicValue data-sc="ComicValue">
                      Current Value: ${comic.currentValue}
                    </S.ComicValue>
                  </S.ComicInfo>
                  <S.CollectButton
                    onClick={() => onCollect(comic.id)}
                    collected={comic.collected}
                    data-sc="CollectButton"
                  >
                    {comic.collected ? "Collected" : "Mark as Collected"}
                  </S.CollectButton>
                </S.ComicItem>
              ))}
            </>
          )}
        </S.SeriesCard>
      ))}
    </S.ComicListContainer>
  );
};

export default ComicList;

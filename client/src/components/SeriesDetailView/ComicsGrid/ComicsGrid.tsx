import React from "react";
import { Star, Check } from "lucide-react";
import { Comic } from "../../../types";
import * as S from "./styles";

interface ComicsGridProps {
  comics: Comic[];
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
}

const ComicsGrid: React.FC<ComicsGridProps> = ({
  comics,
  onCollect,
  onToggleGrail,
}) => {
  return (
    <S.GridContainer data-sc="ComicsGrid">
      {comics.map((comic) => (
        <S.CompactComicCard
          key={comic.id}
          $collected={comic.collected}
          $isGrail={comic.isGrail}
          data-sc="ComicCard"
        >
          <S.ComicHeader>
            <S.IssueNumber>#{comic.issue}</S.IssueNumber>
            <S.HeaderRight>
              {comic.type && (
                <S.TypeBadge $type={comic.type}>{comic.type}</S.TypeBadge>
              )}
              <S.ComicActions>
                <S.ActionButton
                  onClick={() => onToggleGrail(comic.id)}
                  $isActive={comic.isGrail}
                  title={comic.isGrail ? "Remove from grails" : "Mark as grail"}
                >
                  <Star
                    size={16}
                    fill={comic.isGrail ? "currentColor" : "none"}
                  />
                </S.ActionButton>
                <S.ActionButton
                  onClick={() => onCollect(comic.id)}
                  $isActive={comic.collected}
                  title={
                    comic.collected
                      ? "Mark as uncollected"
                      : "Mark as collected"
                  }
                >
                  <Check size={16} />
                </S.ActionButton>
              </S.ComicActions>
            </S.HeaderRight>
          </S.ComicHeader>

          <S.CompactComicDetails>
            <S.ComicMetaLine>
              <span>{comic.years}</span>
              <S.ComicValue>
                ${comic.currentValue?.toLocaleString()}
              </S.ComicValue>
            </S.ComicMetaLine>
          </S.CompactComicDetails>
        </S.CompactComicCard>
      ))}
    </S.GridContainer>
  );
};

export default ComicsGrid;

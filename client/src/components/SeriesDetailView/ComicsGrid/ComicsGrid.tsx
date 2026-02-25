import React, { useState, useCallback } from "react";
import { Star, Check, Pencil } from "lucide-react";
import { Comic } from "../../../types";
import GradeScaleModal from "../../GradeScaleModal";
import { formatCurrency } from "../../../utils/formatters";
import * as S from "./styles";

interface ComicsGridProps {
  comics: Comic[];
  onCollect: (id: string) => void;
  onToggleGrail: (id: string) => void;
  onEdit: (comic: Comic) => void;
}

const ComicsGrid: React.FC<ComicsGridProps> = ({
  comics,
  onCollect,
  onToggleGrail,
  onEdit,
}) => {
  const [selectedComicForGradeScale, setSelectedComicForGradeScale] = useState<Comic | null>(null);

  const handleValueClick = useCallback((e: React.MouseEvent, comic: Comic) => {
    e.stopPropagation();
    setSelectedComicForGradeScale(comic);
  }, []);

  const handleValueKeyDown = useCallback((e: React.KeyboardEvent, comic: Comic) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedComicForGradeScale(comic);
    }
  }, []);

  return (
    <S.GridContainer data-sc="ComicsGrid">
      <GradeScaleModal
        isOpen={!!selectedComicForGradeScale}
        onClose={() => setSelectedComicForGradeScale(null)}
        comic={selectedComicForGradeScale}
      />
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
                  onClick={() => onEdit(comic)}
                  title="Edit details"
                >
                  <Pencil size={16} />
                </S.ActionButton>
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
            {(comic.grade != null || comic.pricePaid != null || comic.currentValue != null) && (
              <S.ComicMetaLine>
                {comic.grade != null && (
                  <S.ComicMetaItem>Grade: {comic.grade}</S.ComicMetaItem>
                )}
                {comic.pricePaid != null && (
                  <S.ComicMetaItem>Paid: {formatCurrency(comic.pricePaid)}</S.ComicMetaItem>
                )}
                {comic.currentValue != null && (
                  <S.ComicValueButton
                    type="button"
                    onClick={(e) => handleValueClick(e, comic)}
                    onKeyDown={(e) => handleValueKeyDown(e, comic)}
                    role="button"
                    tabIndex={0}
                    title="View estimated pricing by grade"
                  >
                    Value: {formatCurrency(comic.currentValue)}
                  </S.ComicValueButton>
                )}
              </S.ComicMetaLine>
            )}
          </S.CompactComicDetails>
        </S.CompactComicCard>
      ))}
    </S.GridContainer>
  );
};

export default ComicsGrid;

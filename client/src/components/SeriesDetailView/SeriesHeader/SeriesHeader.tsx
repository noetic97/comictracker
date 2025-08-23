import React from "react";
import { ArrowLeft, Heart } from "lucide-react";
import Button from "../../shared/Button";
import * as S from "./styles";

interface SeriesHeaderProps {
  publisher: string;
  series: string;
  volume?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
}

const SeriesHeader: React.FC<SeriesHeaderProps> = ({
  publisher,
  series,
  volume,
  isFavorite,
  onToggleFavorite,
  onBack,
}) => {
  const seriesTitle = volume ? `${series} - ${volume}` : series;

  return (
    <S.HeaderTop>
      <Button
        onClick={onBack}
        icon={ArrowLeft}
        variant="secondary"
        size="small"
        shape="circular"
      />
      <S.TitleSection>
        <S.CompactSeriesTitle>
          {seriesTitle}
          <S.FavoriteButton
            onClick={onToggleFavorite}
            $isFavorite={isFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </S.FavoriteButton>
        </S.CompactSeriesTitle>
        <S.CompactPublisher>{publisher}</S.CompactPublisher>
      </S.TitleSection>
    </S.HeaderTop>
  );
};

export default SeriesHeader;

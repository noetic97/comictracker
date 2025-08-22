import React from "react";
import * as S from "./styles";

export interface StatsDisplayProps {
  totalComics: number;
  filteredComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
  collectedValue: number;
  filterOption: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalComics,
  filteredComics,
  collectedComics,
  grailComics,
  totalValue,
  collectedValue,
  filterOption,
}) => {
  return (
    <S.StatsContainer>
      <S.StatsBadge>
        <S.StatsNumber>{totalComics.toLocaleString()}</S.StatsNumber>
        <S.StatsLabel>Total Comics</S.StatsLabel>
      </S.StatsBadge>

      {filterOption !== "all" && (
        <S.StatsBadge variant="filtered">
          <S.StatsNumber>{filteredComics.toLocaleString()}</S.StatsNumber>
          <S.StatsLabel>Filtered</S.StatsLabel>
        </S.StatsBadge>
      )}

      {grailComics > 0 && (
        <S.StatsBadge variant="grail">
          <S.StatsNumber>{grailComics.toLocaleString()}</S.StatsNumber>
          <S.StatsLabel>Grails</S.StatsLabel>
        </S.StatsBadge>
      )}

      <S.StatsBadge variant="collected">
        <S.StatsNumber>{collectedComics.toLocaleString()}</S.StatsNumber>
        <S.StatsLabel>Collected</S.StatsLabel>
      </S.StatsBadge>

      <S.StatsBadge variant="value">
        <S.StatsNumber>
          ${Math.round(collectedValue).toLocaleString()}
        </S.StatsNumber>
        <S.StatsLabel>Collected Value</S.StatsLabel>
      </S.StatsBadge>

      <S.StatsBadge variant="value">
        <S.StatsNumber>
          ${Math.round(totalValue).toLocaleString()}
        </S.StatsNumber>
        <S.StatsLabel>Total Value</S.StatsLabel>
      </S.StatsBadge>
    </S.StatsContainer>
  );
};

export default StatsDisplay;

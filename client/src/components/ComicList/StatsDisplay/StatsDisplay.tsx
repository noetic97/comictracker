import React from "react";
import { useComicStats } from "../../../hooks";
import { FilterOption } from "../../../types";
import * as S from "./styles";

interface StatsDisplayProps {
  filterOption: FilterOption;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ filterOption }) => {
  // Use our new hook to fetch stats based on current filter
  const { stats, loading, error } = useComicStats({ filterOption });

  // Show loading state
  if (loading) {
    return (
      <S.StatsContainer>
        <S.StatsBadge>
          <S.StatsNumber>...</S.StatsNumber>
          <S.StatsLabel>Loading...</S.StatsLabel>
        </S.StatsBadge>
      </S.StatsContainer>
    );
  }

  // // Show error state
  if (error || !stats) {
    return (
      <S.StatsContainer>
        <S.StatsBadge variant="filtered">
          <S.StatsNumber>Error</S.StatsNumber>
          <S.StatsLabel>Failed to load</S.StatsLabel>
        </S.StatsBadge>
      </S.StatsContainer>
    );
  }

  return (
    <S.StatsContainer>
      <S.StatsBadge>
        <S.StatsNumber>{stats.total.toLocaleString()}</S.StatsNumber>
        <S.StatsLabel>Total Comics</S.StatsLabel>
      </S.StatsBadge>

      {filterOption !== "all" && (
        <S.StatsBadge variant="filtered">
          <S.StatsNumber>{stats.total.toLocaleString()}</S.StatsNumber>
          <S.StatsLabel>Filtered</S.StatsLabel>
        </S.StatsBadge>
      )}

      {stats.grails > 0 && (
        <S.StatsBadge variant="grail">
          <S.StatsNumber>{stats.grails.toLocaleString()}</S.StatsNumber>
          <S.StatsLabel>Grails</S.StatsLabel>
        </S.StatsBadge>
      )}

      <S.StatsBadge variant="collected">
        <S.StatsNumber>{stats.collected.toLocaleString()}</S.StatsNumber>
        <S.StatsLabel>Collected</S.StatsLabel>
      </S.StatsBadge>

      <S.StatsBadge variant="value">
        <S.StatsNumber>
          ${Math.round(stats.collectedValue).toLocaleString()}
        </S.StatsNumber>
        <S.StatsLabel>Collected Value</S.StatsLabel>
      </S.StatsBadge>

      <S.StatsBadge variant="value">
        <S.StatsNumber>
          ${Math.round(stats.totalValue).toLocaleString()}
        </S.StatsNumber>
        <S.StatsLabel>Total Value</S.StatsLabel>
      </S.StatsBadge>
    </S.StatsContainer>
  );
};

export default StatsDisplay;

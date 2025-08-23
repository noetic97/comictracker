import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as S from "./styles";

interface CollapsibleStatsSectionProps {
  totalIssues: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number; // New metric!
  isCollapsed: boolean;
  onToggle: () => void;
}

const CollapsibleStatsSection: React.FC<CollapsibleStatsSectionProps> = ({
  totalIssues,
  collectedCount,
  grailCount,
  totalValue,
  collectedValue,
  isCollapsed,
  onToggle,
}) => {
  return (
    <S.CollapsibleStats $isCollapsed={isCollapsed}>
      <S.StatsHeader onClick={onToggle}>
        <span>Series Statistics</span>
        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </S.StatsHeader>
      <S.SeriesStats className={isCollapsed ? "collapsed" : ""}>
        <S.StatItem>
          <S.StatValue>{totalIssues}</S.StatValue>
          <S.StatLabel>Total Issues</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>{grailCount}</S.StatValue>
          <S.StatLabel>Grails</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>{collectedCount}</S.StatValue>
          <S.StatLabel>Collected</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>${collectedValue.toLocaleString()}</S.StatValue>
          <S.StatLabel>Collected Value</S.StatLabel>
        </S.StatItem>
        <S.StatItem>
          <S.StatValue>${totalValue.toLocaleString()}</S.StatValue>
          <S.StatLabel>Total Value</S.StatLabel>
        </S.StatItem>
      </S.SeriesStats>
    </S.CollapsibleStats>
  );
};

export default CollapsibleStatsSection;

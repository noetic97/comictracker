import styled from "styled-components";

export const SeriesDetailContainer = styled.div`
  padding: 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const CompactHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 0.5rem;
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const TitleSection = styled.div`
  flex: 1;
  min-width: 0; // Allows text to truncate if needed
`;

export const CompactSeriesTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $isFavorite }) =>
    $isFavorite ? theme.colors.accent : theme.colors.foreground};
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
    transform: scale(1.1);
  }
`;

export const CompactPublisher = styled.h2`
  font-size: 1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: normal;
  opacity: 0.9;
`;

export const CollapsibleStats = styled.div<{ $isCollapsed: boolean }>`
  margin-bottom: 0.75rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.card};
  overflow: hidden;
  transition: all 0.3s ease;
`;

export const StatsHeader = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

export const SeriesStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  padding: 0 1rem 1rem 1rem;
  max-height: 200px;
  overflow: hidden;
  transition: all 0.3s ease;

  &.collapsed {
    max-height: 0;
    padding: 0 1rem;
  }
`;

export const StatItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: var(--radius);
`;

export const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  margin-top: 0.25rem;
`;

export const ViewControls = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
`;

export const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ControlLabel = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 500;
`;

export const CompactSelect = styled.select`
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.foreground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  min-width: 80px;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

export const ComicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.25rem 0;
`;

export const CompactComicCard = styled.div<{
  $collected: boolean;
  $isGrail?: boolean;
}>`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: var(--radius);
  padding: 0.75rem;
  transition: all 0.3s ease;
  border: 2px solid
    ${({ theme, $isGrail, $collected }) =>
      $isGrail
        ? theme.colors.accent
        : $collected
        ? theme.colors.primary
        : theme.colors.border};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  ${({ $isGrail, theme }) =>
    $isGrail &&
    `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, ${theme.colors.accent}80, ${theme.colors.accent}, ${theme.colors.accent}80);
      z-index: -1;
      border-radius: var(--radius);
      animation: grailGlow 2s ease-in-out infinite alternate;
    }
  `}
`;

export const ComicHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const IssueNumber = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

export const ComicActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{ $isActive?: boolean }>`
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.cardForeground : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  padding: 0.375rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.secondary : theme.colors.border};
    transform: scale(1.05);
  }
`;

export const CompactComicDetails = styled.div`
  // Minimal spacing for compact layout
`;

export const ComicMetaLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.9;
`;

export const ComicValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent};
`;

export const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 1rem;
`;

export const FooterControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const ItemsPerPageControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Legacy exports for backward compatibility
export const SeriesInfo = styled.div``;
export const SeriesTitle = styled.h1``;
export const SeriesPublisher = styled.h2``;
export const SortSelect = styled.select``;
export const GrailButton = styled.button``;
export const ComicDetails = styled.div``;
export const ComicYears = styled.p``;
export const CollectButton = styled.button``;
export const StickyHeader = styled.div``;

import styled from "styled-components";

export const SeriesCard = styled.div`
  margin-bottom: 1rem;
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: ${({ theme }) => theme.colors.card};
`;

export const SeriesHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--radius);

  &:hover {
    background-color: ${({ theme }) => theme.colors.input};
  }

  /* When expanded, flatten the bottom corners */
  .expanded & {
    border-radius: var(--radius) var(--radius) 0 0;
  }
`;

export const SeriesInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const SeriesTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const SeriesTitleText = styled.span`
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  word-break: break-word;
`;

export const GrailIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background};
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 0.5rem;
`;

export const SeriesStats = styled.p`
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
`;

export const SeriesActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.card};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;

  &.expanded {
    max-height: 120px;
    padding: 1rem;
    opacity: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    &.expanded {
      max-height: 140px;
    }
  }
`;

export const SeriesContent = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.expanded {
    max-height: 60vh; /* Allow for scrolling within a reasonable height */
    overflow-y: auto;
  }
`;

export const ComicItem = styled.div<{
  $collected: boolean;
  $isGrail?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, $collected, $isGrail }) => {
    if ($isGrail) return `${theme.colors.accent}20`;
    if ($collected) return `${theme.colors.primary}20`;
    return "transparent";
  }};
  border-left: ${({ theme, $isGrail }) =>
    $isGrail ? `4px solid ${theme.colors.accent}` : "4px solid transparent"};
`;

export const ComicInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

export const ComicTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GrailBadge = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  display: inline-flex;
  align-items: center;
`;

export const ComicMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

export const ComicValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent};
`;

export const ComicActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GrailButton = styled.button<{ $isGrail?: boolean }>`
  background-color: ${({ theme, $isGrail }) =>
    $isGrail ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isGrail }) =>
    $isGrail ? theme.colors.cardForeground : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $isGrail }) =>
      $isGrail ? theme.colors.primary : theme.colors.border};
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
    background-color: ${({ theme, $isGrail }) =>
      $isGrail ? theme.colors.secondary : theme.colors.border};
    transform: scale(1.05);
  }
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

export const CollectButton = styled.button<{ $collected: boolean }>`
  background-color: ${({ theme, $collected }) =>
    $collected ? theme.colors.primary : "transparent"};
  color: ${({ theme, $collected }) =>
    $collected ? theme.colors.cardForeground : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $collected }) =>
      $collected ? theme.colors.primary : theme.colors.border};
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
    background-color: ${({ theme, $collected }) =>
      $collected ? theme.colors.secondary : theme.colors.border};
    transform: scale(1.05);
  }
`;

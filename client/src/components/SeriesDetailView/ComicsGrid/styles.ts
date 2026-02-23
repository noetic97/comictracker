import styled from "styled-components";

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.25rem 0;

  /* Mobile optimization: 2 cards per row instead of 1 */
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  /* Very small screens: still use single column */
  @media (max-width: 425px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
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

  /* Mobile optimization: slightly less padding, but still usable */
  @media (max-width: 767px) {
    padding: 0.6rem;
  }

  @media (max-width: 425px) {
    padding: 0.75rem; /* Back to normal on very small screens */
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
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
`;

export const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
`;

export const IssueNumber = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  flex: 1;
  min-width: 0; /* Allow truncation if needed */

  /* Slightly smaller on mobile for better fit */
  @media (max-width: 767px) {
    font-size: 1rem;
  }

  @media (max-width: 425px) {
    font-size: 1.125rem; /* Back to normal on very small screens */
  }
`;

export const TypeBadge = styled.span<{ $type: string }>`
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
  line-height: 1;

  /* Color coding based on comic type */
  background-color: ${({ theme, $type }) => {
    const type = $type.toLowerCase();
    if (type.includes("annual")) return `${theme.colors.accent}30`;
    if (type.includes("special") || type.includes("giant"))
      return `${theme.colors.secondary}30`;
    if (type.includes("variant") || type.includes("cover"))
      return `${theme.colors.tertiary}30`;
    return `${theme.colors.primary}20`; // Default for "Issue" etc.
  }};

  color: ${({ theme, $type }) => {
    const type = $type.toLowerCase();
    if (type.includes("annual")) return theme.colors.accent;
    if (type.includes("special") || type.includes("giant"))
      return theme.colors.secondary;
    if (type.includes("variant") || type.includes("cover"))
      return theme.colors.tertiary;
    return theme.colors.primary;
  }};

  border: 1px solid
    ${({ theme, $type }) => {
      const type = $type.toLowerCase();
      if (type.includes("annual")) return `${theme.colors.accent}60`;
      if (type.includes("special") || type.includes("giant"))
        return `${theme.colors.secondary}60`;
      if (type.includes("variant") || type.includes("cover"))
        return `${theme.colors.tertiary}60`;
      return `${theme.colors.primary}40`;
    }};

  /* Mobile optimizations */
  @media (max-width: 767px) {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }

  @media (max-width: 425px) {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
  }
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

  /* Slightly smaller buttons on mobile for better fit */
  @media (max-width: 767px) {
    width: 28px;
    height: 28px;
    padding: 0.25rem;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  @media (max-width: 425px) {
    width: 32px; /* Back to normal on very small screens */
    height: 32px;
    padding: 0.375rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const CompactComicDetails = styled.div`
  // Minimal spacing for compact layout
`;

export const ComicMetaLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.9;
`;

export const ComicMetaItem = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
`;

export const ComicValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent};
`;

import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

export const SeriesCard = styled.div`
  margin-bottom: 1rem;
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: ${({ theme }) => theme.colors.card};
`;

export const SeriesHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--radius);

  &:hover {
    background-color: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => readableTextColor(theme.colors.input)};
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
  color: ${({ theme }) => readableTextColor(theme.colors.accent)};
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 0.5rem;
`;

export const FavoriteIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => readableTextColor(theme.colors.accent)};
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

import styled from "styled-components";

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

export const CompactSeriesYears = styled.span`
  display: block;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.85;
`;

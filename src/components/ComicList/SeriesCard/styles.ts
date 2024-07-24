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
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 2rem;
  min-height: 3rem;
  text-align: center;
  align-content: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.input};
  }
`;

export const SeriesContent = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.expanded {
    max-height: 100%; // Adjust this value based on your needs
  }
`;

export const ComicItem = styled.div<{ $collected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${(props) =>
    props.$collected
      ? "${({ theme }) => theme.colors.primary}"
      : "transparent"};
`;

export const ComicInfo = styled.div`
  flex: 1;
`;

export const ComicTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

export const ComicMeta = styled.p`
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const ComicValue = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.accent};
`;

export const CollectButton = styled.button<{ $collected: boolean }>`
  background-color: ${(props) =>
    props.$collected
      ? "${({ theme }) => theme.colors.accent}"
      : "${({ theme }) => theme.colors.secondary}"};
  color: ${({ theme }) => theme.colors.card};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

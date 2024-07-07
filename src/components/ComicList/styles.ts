import styled from "styled-components";

export const ComicListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ExpandContainer = styled.div`
  margin-bottom: 1rem;
`;

export const ToggleButton = styled.button`
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: hsl(var(--primary) / 0.8);
  }
`;

export const SeriesCard = styled.div`
  background-color: hsl(var(--card-foreground) / 0.15);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const SeriesHeader = styled.div`
  padding: 0.75rem 1rem;
  font-weight: bold;
  background-color: hsl(var(--secondary) / 0.5);
  cursor: pointer;
`;

export const ComicItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid hsl(var(--border));
`;

export const ComicInfo = styled.div`
  flex: 1;
`;

export const ComicTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: hsl(var(--primary));
`;

export const ComicMeta = styled.p`
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: hsl(var(--foreground) / 0.7);
`;

export const ComicValue = styled.p`
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: hsl(var(--accent));
`;

export const CollectButton = styled.button<{ collected: boolean }>`
  background-color: ${(props) =>
    props.collected ? "hsl(var(--accent))" : "hsl(var(--secondary))"};
  color: hsl(var(--card));
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

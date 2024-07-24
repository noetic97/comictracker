import styled from "styled-components";

export const ComicListContainer = styled.div`
  padding: 1rem;
`;

export const ExpandContainer = styled.div`
  margin-bottom: 1rem;
`;

export const ToggleButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.foreground};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const PublisherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
`;

export const PublisherCard = styled.div<{ $isExpanded: boolean }>`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  ${({ $isExpanded }) =>
    $isExpanded &&
    `
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
  `}
`;

export const PublisherButton = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  height: ${({ $isExpanded }) => ($isExpanded ? "auto" : "150px")};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.cardForeground};
  border: none;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0) 80%
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }

  &:hover:before {
    transform: rotate(45deg) translate(50%, 50%);
  }

  ${({ $isExpanded }) =>
    $isExpanded &&
    `
    flex-direction: row;
    justify-content: space-between;
    padding: 1.5rem;
    &:before {
      display: none;
    }
  `}
`;

export const PublisherName = styled.span`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

export const SeriesCount = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

export const PublisherComicCount = styled.span`
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

export const SeriesList = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;

  &.expanded {
    max-height: 100%; // Adjust this value based on your needs
    padding: 1rem;
  }
`;

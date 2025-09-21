import styled from "styled-components";

export const AnalysisResults = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const AnalysisResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  svg {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const AnalysisResultsTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
`;

// NEW: Enhanced download buttons
export const DownloadButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const AnalysisStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const AnalysisStat = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const AnalysisNumber = styled.div<{
  error?: boolean;
  warning?: boolean;
}>`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: ${({ theme, error, warning }) =>
    error
      ? theme.colors.error
      : warning
      ? theme.colors.warning
      : theme.colors.primary};
`;

export const AnalysisLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// NEW: Recommendations section
export const RecommendationsSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.warning};
`;

export const RecommendationsTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.warningLight};
  font-size: 0.9rem;
  font-weight: 600;
`;

export const RecommendationsList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
`;

export const RecommendationItem = styled.li`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;

  &:last-child {
    margin-bottom: 0;
  }
`;

// NEW: Expandable sections
export const ExpandableSection = styled.div`
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  overflow: hidden;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }

  svg {
    color: ${({ theme }) => theme.colors.foreground};
    opacity: 0.7;
  }
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

export const SectionContent = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

// Enhanced missing comics list
export const MissingComicsList = styled.div`
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const MissingComicItem = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  border-left: 3px solid ${({ theme }) => theme.colors.warning};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ComicMainInfo = styled.div`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ComicMetaInfo = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;

  span:first-child {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ShowMoreButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.foreground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
`;

// Legacy styles for backward compatibility
export const MissingComicsTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
  font-weight: 600;
`;

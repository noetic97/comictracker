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

export const MissingComicsList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.warningLight};
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.warning};
  max-height: 300px;
  overflow-y: auto;
`;

export const MissingComicsTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.9rem;
  font-weight: 600;
`;

export const MissingComicItem = styled.div`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border-left: 3px solid ${({ theme }) => theme.colors.warning};

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

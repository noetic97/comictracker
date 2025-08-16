import styled, { keyframes } from "styled-components";

const progressAnimation = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

export const ImportContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AnalysisSection = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  padding: 1rem;
`;

export const AnalysisTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
  font-weight: 600;
`;

export const AnalysisDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  font-size: 0.9rem;
`;

export const AnalysisButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const ProgressContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ProgressTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
`;

export const ProgressStats = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  font-size: 0.9rem;
  animation: ${pulseAnimation} 2s ease-in-out infinite;
`;

export const ProgressBarContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 50%,
    ${({ theme }) => theme.colors.primary} 100%
  );
  background-size: 200% 100%;
  animation: ${progressAnimation} 2s linear infinite;
  transition: width 0.3s ease;
  border-radius: 10px;
`;

export const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 600;
  font-size: 0.85rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
`;

export const ProgressDetails = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const ProgressDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9rem;

  svg {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ProgressMeta = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.7;
  font-size: 0.8rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const ResultsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  svg {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ResultsTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
  margin-left: 0.5rem;
`;

export const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.6;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

export const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const ResultsStat = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ResultsNumber = styled.div<{ success?: boolean; error?: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: ${({ theme, success, error }) =>
    success
      ? theme.colors.accent
      : error
      ? theme.colors.error
      : theme.colors.primary};
`;

export const ResultsLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ResultsMeta = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

export const ErrorsList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.errorLight};
  border-radius: var(--radius);
  border: 1px solid ${({ theme }) => theme.colors.error};
`;

export const ErrorsTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
  font-weight: 600;
`;

export const ErrorItem = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  padding-left: 1rem;
  position: relative;

  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.error};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// New Analysis Results Styles
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

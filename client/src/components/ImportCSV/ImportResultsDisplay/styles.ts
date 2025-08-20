import styled from "styled-components";

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

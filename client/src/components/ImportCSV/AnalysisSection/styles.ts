import styled from "styled-components";

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

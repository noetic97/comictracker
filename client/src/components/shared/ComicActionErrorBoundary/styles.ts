import styled from "styled-components";

export const ErrorBoundaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.card};
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: var(--radius);
  margin: 1rem;
  max-width: 600px;
  margin: 1rem auto;
`;

export const ErrorIcon = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
`;

export const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.error};
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.foreground};
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
`;

export const ErrorDetails = styled.details`
  width: 100%;
  margin: 1rem 0;

  summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    padding: 0.5rem;
    border-radius: var(--radius);
    background-color: ${({ theme }) => theme.colors.background};

    &:hover {
      background-color: ${({ theme }) => theme.colors.border};
    }
  }
`;

export const ErrorInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: var(--radius);
  text-align: left;

  p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

export const ErrorStack = styled.div`
  margin-top: 1rem;

  pre {
    background-color: ${({ theme }) => theme.colors.input};
    padding: 1rem;
    border-radius: var(--radius);
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    color: ${({ theme }) => theme.colors.foreground};
    font-family: "Courier New", monospace;
    max-height: 200px;
    overflow-y: auto;
  }
`;

export const ErrorActions = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ErrorHelpText = styled.p`
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 1rem 0 0 0;
`;

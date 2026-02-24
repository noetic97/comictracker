import styled from "styled-components";

export const ScaleList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const ScaleRow = styled.li<{ $even?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.foreground};
  background-color: ${({ theme, $even }) =>
    $even ? theme.colors.background : "rgba(0,0,0,0.04)"};
  border-radius: 2px;

  @media (prefers-color-scheme: dark) {
    background-color: ${({ theme, $even }) =>
      $even ? theme.colors.background : "rgba(255,255,255,0.04)"};
  }
`;

export const ScaleValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  margin-right: 0.5rem;
`;

export const ScaleLabel = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
`;

export const Disclaimer = styled.p`
  margin: 1rem 0 0 0;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

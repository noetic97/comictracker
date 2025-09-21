import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
`;

export const PaginationButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  border: none;
  padding: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  }
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
`;

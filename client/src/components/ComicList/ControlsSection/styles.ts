import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

export const ControlsContainer = styled.div`
  margin-bottom: 1rem;
`;

export const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ToggleButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => readableTextColor(theme.colors.secondary)};
  }

  @media (max-width: 768px) {
    align-self: flex-start;
    margin-bottom: 0.5rem;
  }
`;

export const ShowHiddenLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};

  input[type="checkbox"] {
    cursor: pointer;
  }
  label {
    cursor: pointer;
  }
`;

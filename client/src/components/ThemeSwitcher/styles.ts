import styled from "styled-components";

export const ThemeSwitcherContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ThemeSelect = styled.select`
  background-color: ${(props) => props.theme.colors.card};
  color: ${(props) => props.theme.colors.cardForeground};
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  cursor: pointer;
  max-width: 16rem;

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const RememberToggleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.cardForeground};
`;

export const RememberToggleInput = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${(props) => props.theme.colors.primary};
`;

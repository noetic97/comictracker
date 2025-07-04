import styled from "styled-components";

export const ThemeSwitcherContainer = styled.div`
  margin-top: 1rem;
`;

export const ThemeButton = styled.button<{ $isActive: boolean }>`
  background-color: ${(props) =>
    props.$isActive
      ? props.theme.colors.primary
      : props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.cardForeground};
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

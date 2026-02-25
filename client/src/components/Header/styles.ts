import styled from "styled-components";
import { readableTextColor } from "../../themes/colorUtils";

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const StyledLogoIcon = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

export const IconButton = styled.button<{ $isActive?: boolean }>`
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary + "22" : "none"};
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : "transparent"};
  border-radius: var(--radius, 6px);
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.foreground};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IconContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

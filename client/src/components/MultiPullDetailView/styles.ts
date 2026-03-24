import styled from "styled-components";
import { readableTextColor } from "../../themes/colorUtils";

export const Container = styled.div``;

export const HeaderRow = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const ListName = styled.strong`
  align-self: center;
`;

export const TabsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
  position: sticky;
  top: 0;
  z-index: 120;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 10.5rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 700px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-height: 12rem;
  }
`;

export const TabGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.35rem;
  align-items: stretch;
  min-width: 0;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  border: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.border)};
  border-radius: 12px;
  min-height: 46px;
  padding: 0.4rem 0.75rem;
  font-weight: 700;
  white-space: normal;
  text-align: left;
  line-height: 1.15;
  overflow-wrap: anywhere;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.secondary : theme.colors.card};
  color: ${({ theme, $active }) =>
    $active ? readableTextColor(theme.colors.secondary) : theme.colors.text};

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const RemoveTabButton = styled.button`
  border: none;
  border-radius: 12px;
  min-width: 44px;
  min-height: 46px;
  padding: 0 0.5rem;
  cursor: pointer;
  font-weight: 800;
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => readableTextColor(theme.colors.tertiary)};

  &:hover {
    opacity: 0.9;
  }
`;

export const EmptyState = styled.div`
  padding: 1rem;
`;

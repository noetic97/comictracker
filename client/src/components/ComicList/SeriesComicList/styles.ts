import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

export const ComicItem = styled.div<{
  $collected: boolean;
  $isGrail?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, $collected, $isGrail }) => {
    if ($isGrail) return `${theme.colors.accent}20`;
    if ($collected) return `${theme.colors.primary}20`;
    return "transparent";
  }};
  border-left: ${({ theme, $isGrail, $collected }) =>
    $isGrail
      ? `4px solid ${theme.colors.accent}`
      : $collected
      ? `4px solid ${theme.colors.primary}`
      : "4px solid transparent"};
`;

export const ComicInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

export const ComicTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GrailBadge = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  display: inline-flex;
  align-items: center;
`;

export const ComicMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

export const ComicValue = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent};
`;

export const ComicActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const GrailButton = styled.button<{ $isGrail?: boolean }>`
  background-color: ${({ theme, $isGrail }) =>
    $isGrail ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isGrail }) =>
    $isGrail
      ? readableTextColor(theme.colors.primary)
      : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $isGrail }) =>
      $isGrail ? theme.colors.primary : theme.colors.border};
  padding: 0.375rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ theme, $isGrail }) =>
      $isGrail ? theme.colors.secondary : theme.colors.border};
    color: ${({ theme, $isGrail }) =>
      $isGrail
        ? readableTextColor(theme.colors.secondary)
        : theme.colors.foreground};
    transform: scale(1.05);
  }
`;

export const ActionButton = styled.button<{ $isActive?: boolean }>`
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isActive }) =>
    $isActive
      ? readableTextColor(theme.colors.primary)
      : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  padding: 0.375rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.secondary : theme.colors.border};
    color: ${({ theme, $isActive }) =>
      $isActive
        ? readableTextColor(theme.colors.secondary)
        : theme.colors.foreground};
    transform: scale(1.05);
  }
`;

export const CollectButton = styled.button<{ $collected: boolean }>`
  background-color: ${({ theme, $collected }) =>
    $collected ? theme.colors.primary : "transparent"};
  color: ${({ theme, $collected }) =>
    $collected
      ? readableTextColor(theme.colors.primary)
      : theme.colors.foreground};
  border: 1px solid
    ${({ theme, $collected }) =>
      $collected ? theme.colors.primary : theme.colors.border};
  padding: 0.375rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ theme, $collected }) =>
      $collected ? theme.colors.secondary : theme.colors.border};
    color: ${({ theme, $collected }) =>
      $collected
        ? readableTextColor(theme.colors.secondary)
        : theme.colors.foreground};
    transform: scale(1.05);
  }
`;

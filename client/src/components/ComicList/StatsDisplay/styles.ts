import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

export const StatsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const StatsBadge = styled.div<{
  variant?: "filtered" | "collected" | "grail" | "value";
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case "filtered":
        return `${theme.colors.secondary}20`;
      case "collected":
        return `${theme.colors.primary}20`;
      case "grail":
        return `${theme.colors.accent}20`;
      case "value":
        return `${theme.colors.tertiary}20`;
      default:
        return theme.colors.card;
    }
  }};
  border: 1px solid
    ${({ theme, variant }) => {
      switch (variant) {
        case "filtered":
          return theme.colors.secondary;
        case "collected":
          return theme.colors.primary;
        case "grail":
          return theme.colors.accent;
        case "value":
          return theme.colors.tertiary;
        default:
          return theme.colors.border;
      }
    }};
  border-radius: var(--radius);
  min-width: 80px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const StatsNumber = styled.span`
  font-weight: bold;
  font-size: 1rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.secondary};
`;

export const StatsLabel = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
`;

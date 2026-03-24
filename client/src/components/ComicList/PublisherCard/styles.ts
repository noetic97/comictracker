import styled from "styled-components";
import { readableTextColor } from "../../../themes/colorUtils";

/** Wraps the main publisher tap target + absolutely positioned hide control (avoids nested buttons). */
export const PublisherTapContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const PublisherCard = styled.div<{ $isExpanded: boolean }>`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  ${({ $isExpanded }) =>
    $isExpanded &&
    `
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
  `}
`;

export const PublisherButton = styled.button<{ $isExpanded: boolean }>`
  width: 100%;
  height: ${({ $isExpanded }) => ($isExpanded ? "auto" : "150px")};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  border: none;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0) 80%
    );
    transform: rotate(45deg);
    transition: all 0.3s ease;
  }

  &:hover:before {
    transform: rotate(45deg) translate(50%, 50%);
  }

  &:hover {
    color: ${({ theme }) => readableTextColor(theme.colors.primary)};
  }

  ${({ $isExpanded }) =>
    $isExpanded &&
    `
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1.5rem;
    &:before {
      display: none;
    }
    ${PublisherTopBlock} {
      margin-bottom: 0;
    }
  `}
`;

export const PublisherTopBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const PublisherHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
`;

export const PublisherName = styled.span`
  font-size: 1.1rem;
`;

/** Min ~44×44px touch target (WCAG / mobile); sits above the card tap area. */
export const HideButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  box-sizing: border-box;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: inherit;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  background: rgba(255, 255, 255, 0.18);

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.28);
  }

  &:active {
    opacity: 1;
    background: rgba(255, 255, 255, 0.36);
  }
`;

export const HiddenBadge = styled.span`
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

export const PublisherCardCountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  align-items: flex-start;
`;
export const PublisherCardCounts = styled.span`
  font-size: 0.8rem;
  opacity: 0.8;
`;

export const SeriesList = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;

  &.expanded {
    max-height: 100%; // Adjust this value based on your needs
    padding: 1rem;
  }
`;

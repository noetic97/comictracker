import styled from "styled-components";
import { MessageType } from "./types";

export const MessageContainer = styled.div<{ $type: MessageType }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background-color: ${({ theme, $type }) =>
    $type === "error" ? theme.colors.errorLight : theme.colors.warningLight};
  color: ${({ theme, $type }) =>
    $type === "error" ? theme.colors.error : theme.colors.warning};
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid
    ${({ theme, $type }) =>
      $type === "error"
        ? `${theme.colors.error}40`
        : `${theme.colors.warning}40`};

  /* Enhanced styling for floating messages */
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ theme, $type }) =>
      $type === "error" ? theme.colors.error : theme.colors.warning};
  }
`;

export const IconWrapper = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const MessageText = styled.p`
  margin: 0;
  flex-grow: 1;
  font-weight: 500;
`;

export const DismissButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: inherit;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

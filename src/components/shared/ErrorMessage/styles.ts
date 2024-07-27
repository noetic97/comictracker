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
`;

export const IconWrapper = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
`;

export const MessageText = styled.p`
  margin: 0;
  flex-grow: 1;
`;

export const DismissButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
`;

import styled from "styled-components";
import { X } from "lucide-react";

export const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: min(100vw - 1.5rem, 290px);
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

export const CloseButton = styled(X)`
  cursor: pointer;
  align-self: flex-end;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const MenuTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

export const MenuOption = styled.div`
  margin-bottom: 15px;
`;

export const StatusIndicator = styled.span`
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
  font-weight: normal;
`;

export const SectionLabel = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
`;

export const ShowHiddenGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`;

export const ShowHiddenLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;

  input[type="checkbox"] {
    cursor: pointer;
  }
`;

export const MenuHint = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.78;
`;

export const ActiveActionHint = styled.span`
  display: block;
  font-size: 0.7rem;
  margin-top: 0.35rem;
  opacity: 0.88;
  font-weight: normal;
  line-height: 1.25;
`;

export const QuickHideStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

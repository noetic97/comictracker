import styled from "styled-components";
import { X } from "lucide-react";

export const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100%;
  background-color: hsl(var(--background));
  padding: 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

export const CloseButton = styled(X)`
  cursor: pointer;
  align-self: flex-end;
  color: hsl(var(--foreground));
`;

export const MenuTitle = styled.h2`
  color: hsl(var(--primary));
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

export const MenuOption = styled.div`
  margin-bottom: 15px;
`;

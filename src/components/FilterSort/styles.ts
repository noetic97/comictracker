import styled from "styled-components";
import { X } from "lucide-react";

export const FilterSortContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 60px; // Adjust based on your header height
  left: 0;
  right: 0;
  background-color: hsl(var(--background));
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 1rem;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

export const FilterSortContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
`;

export const FilterLabel = styled.label`
  font-weight: bold;
  color: hsl(var(--foreground));
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--radius);
  background-color: hsl(var(--input));
  color: hsl(var(--foreground));
  border: none;
  font-size: 1rem;

  &:focus {
    outline: 2px solid hsl(var(--primary));
  }
`;

export const ClearButton = styled(X)`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--radius);
  background-color: hsl(var(--input));
  color: hsl(var(--foreground));
  border: none;
  font-size: 1rem;

  &:focus {
    outline: 2px solid hsl(var(--primary));
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

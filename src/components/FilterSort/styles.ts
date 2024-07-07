import styled from "styled-components";
import { X } from "lucide-react";

export const FilterSortContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
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

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: hsl(var(--foreground));
  font-size: 0.9rem;
`;

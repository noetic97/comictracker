import styled from "styled-components";

export const FilterSortContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid
    ${({ theme, $isOpen }) => ($isOpen ? theme.colors.primary : theme.colors.border)};
  border-radius: var(--radius, 6px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 1rem;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
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
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;
`;

export const FilterLabel = styled.label`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const DetailViewNote = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.9;
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.foreground};
  border: none;
  font-size: 1rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

export const ValueRangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

export const ValueInputWrap = styled.div`
  flex: 1 1 0;
  min-width: 0;
  max-width: calc(50% - 0.25rem);
  position: relative;
  display: flex;
  align-items: center;
`;

export const ValueInput = styled.input<{ $hasValue?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  padding-right: ${({ $hasValue }) => ($hasValue ? "1.75rem" : "0.5rem")};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.foreground};
  border: none;
  font-size: 1rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
  }

  /* Hide number input spinner (up/down by penny); user enters whole numbers */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
  appearance: textfield;
`;

export const ValueClearButton = styled.button`
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.15rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 1;
  }
`;

export const ClearFiltersButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    opacity: 0.9;
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
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

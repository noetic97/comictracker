import styled from "styled-components";

export const FilterSortContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 60px; // Adjust based on your header height
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
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
  color: ${({ theme }) => theme.colors.foreground};
  cursor: pointer;
`;

export const FilterLabel = styled.label`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.foreground};
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

export const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

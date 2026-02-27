import styled from "styled-components";

export const ViewControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  /* Only stack on very small screens (smaller than iPhone SE) */
  @media (max-width: 425px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  /* For medium mobile screens, keep side-by-side but adjust spacing */
  @media (max-width: 767px) and (min-width: 481px) {
    gap: 0.75rem;
  }
`;

export const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

export const SortDropdownButton = styled.button`
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.foreground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  min-width: 120px;
  max-width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SortDropdownPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 2px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
  max-height: 280px;
  overflow-y: auto;
`;

export const SortDropdownOption = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.4rem 0.75rem;
  border: none;
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primary : "transparent")};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.background : theme.colors.foreground)};
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.input)};
  }
`;

export const ItemsPerPageControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ControlLabel = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 500;
  flex-shrink: 0;
`;

export const CompactSelect = styled.select`
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.foreground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.875rem;
  min-width: 120px;
  max-width: 100%;
  cursor: pointer;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  /* Slightly smaller on mobile to fit better */
  @media (max-width: 425px) {
    font-size: 0.8rem;
    min-width: 70px;
    padding: 0.2rem 0.4rem;
  }
`;

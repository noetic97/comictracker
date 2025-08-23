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
  min-width: 80px;
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

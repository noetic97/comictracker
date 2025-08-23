import styled from "styled-components";

export const SeriesDetailContainer = styled.div`
  padding: 0.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const CompactHeader = styled.div`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 0.5rem;
`;

export const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 100;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 1rem;
`;

export const FooterControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const ItemsPerPageControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

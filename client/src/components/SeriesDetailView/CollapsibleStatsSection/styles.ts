import styled from "styled-components";

export const CollapsibleStats = styled.div<{ $isCollapsed: boolean }>`
  margin-bottom: 0.75rem;
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.card};
  overflow: hidden;
  transition: all 0.3s ease;
`;

export const StatsHeader = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

export const SeriesStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  padding: 0 1rem 1rem 1rem;
  max-height: 200px;
  overflow: hidden;
  transition: all 0.3s ease;

  &.collapsed {
    max-height: 0;
    padding: 0 1rem;
  }
`;

export const StatItem = styled.div`
  text-align: center;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: var(--radius);
`;

export const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  margin-top: 0.25rem;
`;

import styled, { keyframes } from "styled-components";

const progressAnimation = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

export const ProgressContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const ProgressTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
`;

export const ProgressStats = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.8;
  font-size: 0.9rem;
  animation: ${pulseAnimation} 2s ease-in-out infinite;
`;

export const ProgressBarContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  height: 20px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.secondary} 50%,
    ${({ theme }) => theme.colors.primary} 100%
  );
  background-size: 200% 100%;
  animation: ${progressAnimation} 2s linear infinite;
  transition: width 0.3s ease;
  border-radius: 10px;
`;

export const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 600;
  font-size: 0.85rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
`;

export const ProgressDetails = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

export const ProgressDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 0.9rem;

  svg {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ProgressMeta = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.7;
  font-size: 0.8rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

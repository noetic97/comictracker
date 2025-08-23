import styled, { keyframes } from "styled-components";

// Animations
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const burstIn = keyframes`
  0% { 
    opacity: 0; 
    transform: scale(0.3) rotate(-15deg); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2) rotate(5deg); 
  }
  100% { 
    opacity: 0; 
    transform: scale(0.8) rotate(0deg); 
  }
`;

const dotBounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Components
export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.background}f0,
    ${({ theme }) => theme.colors.primary}20
  );
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-out;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
`;

export const SpinnerContainer = styled.div`
  position: relative;
  animation: ${float} 3s ease-in-out infinite;
`;

export const ComicBook = styled.div`
  width: 120px;
  height: 150px;
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  animation: ${spin} 4s linear infinite;
  transform-style: preserve-3d;
  border: 3px solid ${({ theme }) => theme.colors.foreground};
`;

export const ComicCover = styled.div`
  padding: 1rem 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border: 2px solid ${({ theme }) => theme.colors.foreground};
    border-radius: 4px;
  }
`;

export const ComicTitle = styled.div`
  font-size: 1rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.foreground};
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: "Impact", "Arial Black", sans-serif;
`;

export const ComicSubtitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.foreground};
  letter-spacing: 1px;
  margin-top: 0.25rem;
  font-family: "Impact", "Arial Black", sans-serif;
`;

export const LoadingText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MainMessage = styled.h2`
  font-size: 2rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  font-family: "Impact", "Arial Black", sans-serif;
  animation: ${pulse} 2s ease-in-out infinite;

  /* Comic book text effect */
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent}
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const SubMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.foreground};
  margin: 0;
  opacity: 0.8;
  font-weight: 500;
`;

export const ComicEffects = styled.div`
  position: relative;
  height: 60px;
  width: 300px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

export const BurstEffect = styled.div<{ delay: string }>`
  font-size: 1.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.accent};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: "Impact", "Arial Black", sans-serif;
  animation: ${burstIn} 3s infinite;
  animation-delay: ${({ delay }) => delay};
  position: absolute;

  &:nth-child(1) {
    left: 10%;
  }
  &:nth-child(2) {
    left: 45%;
  }
  &:nth-child(3) {
    right: 10%;
  }
`;

export const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const Dot = styled.div<{ delay: string }>`
  width: 12px;
  height: 12px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${dotBounce} 1.4s infinite;
  animation-delay: ${({ delay }) => delay};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

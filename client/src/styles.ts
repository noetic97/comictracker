import styled from "styled-components";

export const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

export const HeaderContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

export const FloatingStatusMessage = styled.div`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 0.75rem 1.5rem;
  background-color: rgba(66, 165, 245, 0.95);
  color: white;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideInFromTop 0.3s ease-out;
  max-width: 90vw;
  text-align: center;
`;

export const FloatingErrorContainer = styled.div`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  max-width: 90vw;
  animation: slideInFromTop 0.3s ease-out;
`;

export const RefreshIndicatorContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  padding: 0.75rem 1rem;
  background-color: rgba(66, 165, 245, 0.9);
  color: white;
  border-radius: var(--radius);
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: rgba(66, 165, 245, 1);
  }
`;

export const RefreshIndicatorInner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

export const OfflineBanner = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  background-color: rgba(251, 191, 36, 0.15);
  color: #92400e;
  border: 1px solid rgba(245, 158, 11, 0.6);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

import styled from "styled-components";

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const StyledLogoIcon = styled.div`
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(
    45deg,
    hsl(var(--primary)),
    hsl(var(--secondary))
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

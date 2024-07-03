import styled from "styled-components";

export const AppContainer = styled.div`
  background: linear-gradient(to bottom right, #4a1d96, #1e3a8a);
  color: white;
  min-height: 100vh;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const StyledLogoIcon = styled.div`
  background-color: #facc15;
  color: black;
  padding: 0.5rem;
  border-radius: 50%;
  margin-right: 1rem;
`;

export const StyledTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #facc15, #ef4444, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

export const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

export const FileUpload = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const UploadButton = styled.button`
  background-color: #facc15;
  color: #4a1d96;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fde68a;
  }
`;

export const FileName = styled.span`
  margin-left: 0.75rem;
  color: #d1d5db;
`;

export const StyledInput = styled.input`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;

  &:focus {
    outline: 2px solid #facc15;
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;

  &:focus {
    outline: 2px solid #facc15;
  }

  @media (min-width: 768px) {
    width: auto;
  }
`;

export const StyledButton = styled.button`
  width: 100%;
  background-color: transparent;
  border: 1px solid #facc15;
  color: #facc15;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;

  &:hover {
    background-color: #facc15;
    color: black;
  }

  @media (min-width: 768px) {
    width: auto;
  }
`;

export const ExpandContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: background-color 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
`;

export const CardTitle = styled.h2`
  color: #facc15;
  font-size: 1rem;
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const CardContent = styled.div`
  padding: 0.75rem;
`;

export const ComicItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

export const ComicInfo = styled.div`
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

export const ComicTitle = styled.h3`
  color: #f472b6;
  font-weight: 600;
  font-size: 0.9rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

export const ComicMeta = styled.p`
  font-size: 0.8rem;
  color: #fde68a;
`;

export const ComicValue = styled.p`
  font-size: 0.8rem;
  color: #4ade80;
`;

export const CollectButton = styled(StyledButton)`
  background-color: transparent;
  padding: 0.4rem;
  font-size: 0.9rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #facc15;
  }

  @media (min-width: 768px) {
    width: auto;
  }
`;

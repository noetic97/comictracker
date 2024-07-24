import styled from "styled-components";

export const UploadButton = styled.button`
  background-color: ${({ theme }) => theme.colors.foreground};
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

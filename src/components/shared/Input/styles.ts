import styled, { css } from "styled-components";

export const InputWrapper = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
`;

export const Label = styled.label`
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const IconWrapper = styled.span`
  position: absolute;
  left: 0.75rem;
  color: ${({ theme }) => theme.colors.foreground};
`;

export const StyledInput = styled.input<{
  $hasIcon: boolean;
  $hasError: boolean;
}>`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  transition: border-color 0.2s;

  ${(props) =>
    props.$hasIcon &&
    css`
      padding-left: 2.5rem;
    `}

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.foreground}80;
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.foreground};
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 0.25rem;
`;

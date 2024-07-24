import styled, { css } from "styled-components";
import { ButtonVariant, ButtonSize, ButtonShape } from "./Button";

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $shape: ButtonShape;
  $fullWidth: boolean;
  $iconOnly: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      padding: ${$size === "small"
        ? "0.25rem"
        : $size === "medium"
        ? "0.5rem"
        : "0.75rem"};
    `}

    ${({ theme, $variant, $size, $shape, $iconOnly }) => css`
    background-color: ${theme.colors[$variant]};
    color: ${theme.colors.cardForeground};
    font-size: ${$size === "small"
      ? "0.875rem"
      : $size === "medium"
      ? "1rem"
      : "1.125rem"};

    ${$shape === "default" && `border-radius: var(--radius);`}
    ${$shape === "rounded" && `border-radius: 3rem;`}
    ${$shape === "circular" && `border-radius: 50%;`}

    ${$iconOnly
      ? css`
          padding: ${$size === "small"
            ? "0.5rem"
            : $size === "medium"
            ? "0.75rem"
            : "1rem"};
          ${$shape === "circular" &&
          css`
            width: ${$size === "small"
              ? "2rem"
              : $size === "medium"
              ? "2.5rem"
              : "3rem"};
            height: ${$size === "small"
              ? "2rem"
              : $size === "medium"
              ? "2.5rem"
              : "3rem"};
          `}
        `
      : css`
          padding: ${$size === "small"
            ? "0.25rem 0.5rem"
            : $size === "medium"
            ? "0.5rem 1rem"
            : "0.75rem 1.5rem"};
        `}

    &:hover:not(:disabled) {
      background-color: ${theme.colors[
        $variant === "primary" ? "secondary" : "primary"
      ]};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

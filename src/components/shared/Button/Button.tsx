import React from "react";
import * as S from "./styles";
import { LucideIcon } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonShape = "default" | "rounded" | "circular";

export interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  size = "medium",
  shape = "default",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  type = "button",
}) => {
  const iconOnly = !children && !!Icon;

  return (
    <S.StyledButton
      onClick={onClick}
      $variant={variant}
      $size={size}
      $shape={shape}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      disabled={disabled}
      type={type}
    >
      {Icon && (iconPosition === "left" || iconOnly) && (
        <Icon size={size === "small" ? 16 : size === "medium" ? 20 : 24} />
      )}
      {children && <span>{children}</span>}
      {Icon && iconPosition === "right" && !iconOnly && (
        <Icon size={size === "small" ? 16 : size === "medium" ? 20 : 24} />
      )}
    </S.StyledButton>
  );
};

export default Button;

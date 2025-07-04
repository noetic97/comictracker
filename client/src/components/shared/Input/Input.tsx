import React, { InputHTMLAttributes, forwardRef } from "react";
import { X } from "lucide-react";
import * as S from "./styles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, onClear, fullWidth = false, ...props }, ref) => {
    return (
      <S.InputWrapper $fullWidth={fullWidth}>
        {label && <S.Label htmlFor={props.id}>{label}</S.Label>}
        <S.InputContainer>
          {icon && <S.IconWrapper>{icon}</S.IconWrapper>}
          <S.StyledInput
            ref={ref}
            $hasIcon={!!icon}
            $hasError={!!error}
            {...props}
          />
          {onClear && props.value && (
            <S.ClearButton onClick={onClear} type="button">
              <X size={18} />
            </S.ClearButton>
          )}
        </S.InputContainer>
        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
      </S.InputWrapper>
    );
  }
);

Input.displayName = "Input";

export default Input;

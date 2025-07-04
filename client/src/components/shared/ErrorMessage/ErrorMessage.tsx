import React from "react";
import * as S from "./styles";
import { ErrorMessageProps } from "./types";
import { AlertCircle, AlertTriangle, X } from "lucide-react";

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = "error",
  showIcon = true,
  onDismiss,
}) => {
  const Icon = type === "error" ? AlertCircle : AlertTriangle;

  return (
    <S.MessageContainer $type={type}>
      {showIcon && (
        <S.IconWrapper>
          <Icon size={18} />
        </S.IconWrapper>
      )}
      <S.MessageText>{message}</S.MessageText>
      {onDismiss && (
        <S.DismissButton onClick={onDismiss} aria-label="Dismiss message">
          <X size={18} />
        </S.DismissButton>
      )}
    </S.MessageContainer>
  );
};

export default ErrorMessage;

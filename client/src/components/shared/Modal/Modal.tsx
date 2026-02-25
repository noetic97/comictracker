import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import * as S from "./styles";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "fullscreen";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "large",
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <S.ModalOverlay onClick={handleBackdropClick}>
      <S.ModalContent $size={size} onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>{title}</S.ModalTitle>
          <S.CloseButton
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X size={24} />
          </S.CloseButton>
        </S.ModalHeader>
        <S.ModalBody>{children}</S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;

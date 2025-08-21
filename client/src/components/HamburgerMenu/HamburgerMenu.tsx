import React from "react";
import { Upload } from "lucide-react";
import Button from "../shared/Button";
import ClearDatabase from "../ClearDatabase";
import { Comic } from "../../types";
import * as S from "./styles";
import ThemeSwitcher from "../ThemeSwitcher";

interface Props {
  isOpen: boolean;
  onImport: (comics: Comic[]) => void;
  onClose: () => void;
  onOpenImportModal: () => void;
  importStatus?: string; // Optional status to show import progress
}

const HamburgerMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenImportModal,
  importStatus,
}) => {
  if (!isOpen) return null;

  const handleImportClick = () => {
    onOpenImportModal();
    onClose(); // Close the hamburger menu when opening import modal
  };

  return (
    <S.MenuContainer data-sc="MenuContainer">
      <S.CloseButton size={24} onClick={onClose} data-sc="CloseButton" />
      <S.MenuTitle data-sc="MenuTitle">Menu</S.MenuTitle>

      <S.MenuOption data-sc="MenuOption">
        <Button
          onClick={handleImportClick}
          icon={Upload}
          variant="primary"
          fullWidth
        >
          Import Comics
          {importStatus && (
            <S.StatusIndicator>{importStatus}</S.StatusIndicator>
          )}
        </Button>
      </S.MenuOption>

      <S.MenuOption data-sc="MenuOption">
        <ThemeSwitcher />
      </S.MenuOption>

      <S.MenuOption data-sc="MenuOption">
        <ClearDatabase />
      </S.MenuOption>
    </S.MenuContainer>
  );
};

export default HamburgerMenu;

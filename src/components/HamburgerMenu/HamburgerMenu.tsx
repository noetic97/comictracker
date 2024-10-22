import React from "react";
import ImportCSV from "../ImportCSV";
import { Comic } from "../../types";
import * as S from "./styles";
import ThemeSwitcher from "../ThemeSwitcher";

interface Props {
  isOpen: boolean;
  onImport: (comics: Comic[]) => void;
  onClose: () => void;
}

const HamburgerMenu: React.FC<Props> = ({ isOpen, onImport, onClose }) => {
  if (!isOpen) return null;

  return (
    <S.MenuContainer data-sc="MenuContainer">
      <S.CloseButton size={24} onClick={onClose} data-sc="CloseButton" />
      <S.MenuTitle data-sc="MenuTitle">Menu</S.MenuTitle>
      <S.MenuOption data-sc="MenuOption">
        <ImportCSV onImport={onImport} />
      </S.MenuOption>
      <S.MenuOption data-sc="MenuOption">
        <ThemeSwitcher />
      </S.MenuOption>
    </S.MenuContainer>
  );
};

export default HamburgerMenu;

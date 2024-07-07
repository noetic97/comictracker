import React from "react";
import ImportCSV from "../ImportCSV";
import { Comic } from "../../types";
import * as S from "./styles";

interface Props {
  onImport: (comics: Comic[]) => void;
  onClose: () => void;
}

const HamburgerMenu: React.FC<Props> = ({ onImport, onClose }) => {
  return (
    <S.MenuContainer>
      <S.CloseButton size={24} onClick={onClose} />
      <S.MenuTitle>Menu</S.MenuTitle>
      <S.MenuOption>
        <ImportCSV onImport={onImport} />
      </S.MenuOption>
      {/* Add more menu items here */}
    </S.MenuContainer>
  );
};

export default HamburgerMenu;

import React, { useState } from "react";
import { Zap, Menu } from "lucide-react";
import { Comic } from "../../types.ts";
import * as S from "./styles";
import HamburgerMenu from "../HamburgerMenu";

interface Props {
  onImport: (comics: Comic[]) => void;
}

const Header: React.FC<Props> = ({ onImport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <S.StyledHeader>
      <S.LogoContainer>
        <S.StyledLogoIcon>
          <Zap size={32} />
        </S.StyledLogoIcon>
        <S.StyledTitle>Comic Want List</S.StyledTitle>
      </S.LogoContainer>
      <Menu
        size={24}
        style={{ cursor: "pointer" }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
      {isMenuOpen && (
        <HamburgerMenu
          onImport={onImport}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </S.StyledHeader>
  );
};

export default Header;

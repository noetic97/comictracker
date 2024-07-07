import React from "react";
import { Zap, Menu, Filter } from "lucide-react";
import * as S from "./styles";

interface Props {
  onFilterClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<Props> = ({ onFilterClick, onMenuClick }) => {
  return (
    <S.HeaderContainer data-sc="HeaderContainer">
      <S.LogoContainer data-sc="LogoContainer">
        <S.StyledLogoIcon data-sc="StyledLogoIcon">
          <Zap size={32} />
        </S.StyledLogoIcon>
        <S.StyledTitle data-sc="StyledTitle">Comic Want List</S.StyledTitle>
      </S.LogoContainer>
      <S.IconContainer data-sc="IconContainer">
        <S.IconButton onClick={onFilterClick} data-sc="IconButton">
          <Filter size={24} />
        </S.IconButton>
        <S.IconButton onClick={onMenuClick} data-sc="IconButton">
          <Menu size={24} />
        </S.IconButton>
      </S.IconContainer>
    </S.HeaderContainer>
  );
};

export default Header;

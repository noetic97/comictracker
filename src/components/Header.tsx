import { Zap } from "lucide-react";
import {
  StyledHeader,
  StyledTitle,
  StyledLogoIcon,
  LogoContainer,
} from "../styles/index";

const Header = () => {
  return (
    <StyledHeader>
      <LogoContainer>
        <StyledLogoIcon>
          <Zap size={32} />
        </StyledLogoIcon>
        <StyledTitle>Comic Want List</StyledTitle>
      </LogoContainer>
    </StyledHeader>
  );
};

export default Header;

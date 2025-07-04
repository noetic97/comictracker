import React from "react";
import { useTheme } from "../../themes/ThemeContext";
import { ThemeButton, ThemeSwitcherContainer } from "./styles";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <ThemeSwitcherContainer data-sc="ThemeSwitcherContainer">
      <h3>Choose Theme</h3>
      {availableThemes.map((t) => (
        <ThemeButton
          key={t.name}
          onClick={() => setTheme(t)}
          $isActive={theme.name === t.name}
          data-sc="ThemeButton"
        >
          {t.name}
        </ThemeButton>
      ))}
    </ThemeSwitcherContainer>
  );
};

export default ThemeSwitcher;

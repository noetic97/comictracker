import React, { ChangeEvent } from "react";
import { useTheme } from "../../themes/ThemeContext";
import {
  ThemeSwitcherContainer,
  ThemeSelect,
  RememberToggleLabel,
  RememberToggleInput,
} from "./styles";

const ThemeSwitcher: React.FC = () => {
  const {
    theme,
    setTheme,
    availableThemes,
    rememberSelection,
    setRememberSelection,
  } = useTheme();

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedTheme = availableThemes.find(
      (t) => t.name === event.target.value
    );

    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };

  return (
    <ThemeSwitcherContainer data-sc="ThemeSwitcherContainer">
      <h3>Choose Theme</h3>
      <ThemeSelect
        value={theme.name}
        onChange={handleThemeChange}
        data-sc="ThemeSelect"
      >
        {availableThemes.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </ThemeSelect>
      <RememberToggleLabel data-sc="RememberToggleLabel">
        <RememberToggleInput
          type="checkbox"
          checked={rememberSelection}
          onChange={(event) => setRememberSelection(event.target.checked)}
          data-sc="RememberToggleInput"
        />
        Remember my theme
      </RememberToggleLabel>
    </ThemeSwitcherContainer>
  );
};

export default ThemeSwitcher;

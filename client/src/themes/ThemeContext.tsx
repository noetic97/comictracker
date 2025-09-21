import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { Theme } from "./types";
import { defaultTheme, themes } from "./themes";
import { ensureAccessibleTheme } from "./colorUtils";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
  rememberSelection: boolean;
  setRememberSelection: (remember: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "comictracker:selectedTheme";
const THEME_REMEMBER_KEY = "comictracker:rememberTheme";

const getInitialPreferences = (): {
  theme: Theme;
  remember: boolean;
} => {
  if (typeof window === "undefined") {
    return { theme: ensureAccessibleTheme(defaultTheme), remember: false };
  }

  try {
    const remember = window.localStorage.getItem(THEME_REMEMBER_KEY) === "true";
    if (!remember) {
      return { theme: defaultTheme, remember: false };
    }

    const storedThemeName = window.localStorage.getItem(THEME_STORAGE_KEY);
    const storedTheme = themes.find((t) => t.name === storedThemeName);

    return {
      theme: ensureAccessibleTheme(storedTheme ?? defaultTheme),
      remember,
    };
  } catch {
    return { theme: ensureAccessibleTheme(defaultTheme), remember: false };
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { theme: initialTheme, remember: initialRemember } =
    getInitialPreferences();

  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [rememberSelection, setRememberSelectionState] = useState<boolean>(
    initialRemember
  );

  const setTheme = (newTheme: Theme) => {
    const accessibleTheme = ensureAccessibleTheme(newTheme);
    setThemeState(accessibleTheme);
    if (typeof window === "undefined") return;

    if (rememberSelection) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, accessibleTheme.name);
      } catch {
        // Ignore storage write errors
      }
    }
  };

  const setRememberSelection = (remember: boolean) => {
    setRememberSelectionState(remember);

    if (typeof window === "undefined") return;

    try {
      if (remember) {
        window.localStorage.setItem(THEME_REMEMBER_KEY, "true");
        window.localStorage.setItem(THEME_STORAGE_KEY, theme.name);
      } else {
        window.localStorage.removeItem(THEME_REMEMBER_KEY);
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !rememberSelection) return;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme.name);
    } catch {
      // Ignore storage write errors
    }
  }, [theme, rememberSelection]);

  const value = {
    theme,
    setTheme,
    availableThemes: themes,
    rememberSelection,
    setRememberSelection,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Add this type assertion to make our Theme compatible with styled-components
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}

import React, { createContext, useState, useContext, ReactNode } from "react";
import { Theme } from "./types";
import { defaultTheme, themes } from "./themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const value = {
    theme,
    setTheme,
    availableThemes: themes,
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

  console.log({ context });

  return context;
};

// Add this type assertion to make our Theme compatible with styled-components
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}

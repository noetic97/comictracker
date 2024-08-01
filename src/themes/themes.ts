import { Theme } from "./types";

export const defaultTheme: Theme = {
  name: "Default",
  colors: {
    background: "#4A258D",
    foreground: "#FFFFFF",
    primary: "#B26AB4",
    secondary: "#FAD205",
    tertiary: "#51FF8B",
    accent: "#FF9800",
    card: "#65459E",
    cardForeground: "#FFFFFF",
    border: "#8E6FC1",
    input: "#5C3AAD",
    error: "#FF5252",
    errorLight: "#FFCDD2",
    warning: "#FFC107",
    warningLight: "#FFF8E1",
  },
};

const spiderManTheme: Theme = {
  name: "Spider-Man",
  colors: {
    background: "#0D47A1",
    foreground: "#FFFFFF",
    primary: "#EF5350",
    secondary: "#FFD54F",
    tertiary: "#2196F3",
    accent: "#212121",
    card: "#1565C0",
    cardForeground: "#FFFFFF",
    border: "#42A5F5",
    input: "#0A2472",
    error: "#FF1744",
    errorLight: "#FFCDD2",
    warning: "#FFC107",
    warningLight: "#FFF8E1",
  },
};

const greenGoblinTheme: Theme = {
  name: "Green Goblin",
  colors: {
    background: "#1B5E20",
    foreground: "#FFFFFF",
    primary: "#7B1FA2",
    secondary: "#FF5252",
    tertiary: "#FFC107",
    accent: "#212121",
    card: "#2E7D32",
    cardForeground: "#FFFFFF",
    border: "#4CAF50",
    input: "#0A3D0A",
    error: "#FF1744",
    errorLight: "#FFCDD2",
    warning: "#FFA000",
    warningLight: "#FFECB3",
  },
};

const ironManTheme: Theme = {
  name: "Iron Man",
  colors: {
    background: "#B71C1C",
    foreground: "#FFFFFF",
    primary: "#FFD54F",
    secondary: "#2962FF",
    tertiary: "#FF5722",
    accent: "#212121",
    card: "#C62828",
    cardForeground: "#FFFFFF",
    border: "#EF5350",
    input: "#7F0000",
    error: "#FF1744",
    errorLight: "#FFCDD2",
    warning: "#FFC107",
    warningLight: "#FFF8E1",
  },
};

export const themes: Theme[] = [spiderManTheme, greenGoblinTheme, ironManTheme];

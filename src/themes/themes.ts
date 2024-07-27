import { Theme } from "./types";

export const defaultTheme: Theme = {
  name: "Default",
  colors: {
    background: "#4A258D",
    foreground: "#FFFFFF",
    primary: "#B26AB4",
    secondary: "#FAD205",
    tertiary: "#FFFFFF",
    accent: "#51FF8B",
    card: "#65459E",
    cardForeground: "#FFFFFF",
    border: "#FFFFFF",
    input: "#4A258D",
    error: "#ff0505",
    errorLight: "#ff5b00",
    warning: "#ff8f00",
    warningLight: "#ffc302",
  },
};

export const spiderManTheme: Theme = {
  name: "Spider-Man",
  colors: {
    background: "#0D47A1", // Dark Blue
    foreground: "#FFFFFF", // White
    primary: "#EF5350", // Red
    secondary: "#FFD54F", // Gold
    tertiary: "#FFFFFF",
    accent: "#212121", // Black
    card: "#1565C0", // Lighter Blue
    cardForeground: "#FFFFFF", // White
    border: "#2196F3", // Light Blue
    input: "#0A2472", // Darker Blue
    error: "#ff0505",
    errorLight: "#ff5b00",
    warning: "#ff8f00",
    warningLight: "#ffc302",
  },
};

export const greenGoblinTheme: Theme = {
  name: "Green Goblin",
  colors: {
    background: "#1B5E20", // Dark Green
    foreground: "#FFFFFF", // White
    primary: "#7B1FA2", // Purple
    secondary: "#FF5252", // Red
    tertiary: "#FFFFFF",
    accent: "#212121", // Black
    card: "#2E7D32", // Lighter Green
    cardForeground: "#FFFFFF", // White
    border: "#4CAF50", // Light Green
    input: "#0A3D0A", // Darker Green
    error: "#ff0505",
    errorLight: "#ff5b00",
    warning: "#ff8f00",
    warningLight: "#ffc302",
  },
};

export const ironManTheme: Theme = {
  name: "Iron Man",
  colors: {
    background: "#B71C1C", // Dark Red
    foreground: "#FFFFFF", // White
    primary: "#FFD54F", // Gold
    secondary: "#2962FF", // Blue
    tertiary: "#FFFFFF",
    accent: "#212121", // Black
    card: "#C62828", // Lighter Red
    cardForeground: "#FFFFFF", // White
    border: "#EF5350", // Light Red
    input: "#7F0000", // Darker Red
    error: "#ff0505",
    errorLight: "#ff5b00",
    warning: "#ff8f00",
    warningLight: "#ffc302",
  },
};

export const themes: Theme[] = [
  defaultTheme,
  spiderManTheme,
  greenGoblinTheme,
  ironManTheme,
];

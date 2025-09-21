import { readableColor } from "polished";
import { Theme } from "./types";

const LIGHT_FALLBACK = "#FFFFFF";
const DARK_FALLBACK = "#0F172A";

export const readableTextColor = (
  background: string,
  light: string = LIGHT_FALLBACK,
  dark: string = DARK_FALLBACK
): string => readableColor(background, light, dark, true);

export const ensureAccessibleTheme = (theme: Theme): Theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    foreground: readableTextColor(theme.colors.background),
    cardForeground: readableTextColor(theme.colors.card),
  },
});

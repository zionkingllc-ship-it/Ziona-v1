import { spacing } from "@/constants/spacing";
import { themes, tokens } from "@tamagui/themes";
import { createFont, createTamagui } from "tamagui";
import colors from "./constants/colors";

/* -----------------------------------------------------
   Shared Font Sizes
----------------------------------------------------- */

const fontSizes = {
  1: 12,
  2: 14,
  3: 16,
  4: 18,
  5: 20,
  6: 24,
  7: 30,
  8: 36,
};

/* -----------------------------------------------------
   App Tokens
----------------------------------------------------- */

const appTokens = {
  color: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  },
  radius: {
    borderRadius: spacing.borderRadius,
  },
};

/* -----------------------------------------------------
   App Themes
----------------------------------------------------- */

const appThemes = {
  light: {
    background: colors.background,
    color: colors.text,
    primary: colors.primary,
    secondary: colors.secondary,
  },
  dark: {
    background: colors.primary,
    color: colors.white,
    primary: colors.secondary,
    secondary: "#B3B3FF",
  },
};

/* -----------------------------------------------------
   Mona Sans (UI Font)
----------------------------------------------------- */

const monaSansFont = createFont({
  family: "MonaSans",

  size: fontSizes,

  weight: {
    4: "400",
    5: "500",
    6: "600",
    7: "700",
  },

  face: {
    400: { normal: "MonaSans_400" },
    500: { normal: "MonaSans_500" },
    600: { normal: "MonaSans_600" },
    700: { normal: "MonaSans_700" },
  },
});

/* -----------------------------------------------------
   EB Garamond (Serif / Scripture Font)
   FIXED ITALIC
----------------------------------------------------- */

const ebGaramondFont = createFont({
  family: "EBGaramond",

  size: fontSizes,

  weight: {
    4: "400",
    5: "500",
    6: "600",
  },

  face: {
    400: {
      normal: "EBGaramond_400",
      italic: "EBGaramond_400_Italic",
    },
    500: {
      normal: "EBGaramond_500",
    },
    600: {
      normal: "EBGaramond_600",
    },
  },
});

/* -----------------------------------------------------
   Merienda (Decorative Script)
----------------------------------------------------- */

const meriendaFont = createFont({
  family: "Merienda",

  size: fontSizes,

  weight: {
    4: "400",
    5: "500",
    6: "600",
  },

  face: {
    400: { normal: "Merienda_400" },
    500: { normal: "Merienda_500" },
    600: { normal: "Merienda_600" },
  },
});

/* -----------------------------------------------------
   Create Tamagui Config
----------------------------------------------------- */

const config = createTamagui({
  tokens: {
    ...tokens,
    color: {
      ...tokens.color,
      ...appTokens.color,
    },
    radius: {
      ...tokens.radius,
      ...appTokens.radius,
    },
  },

  themes: {
    ...themes,
    ...appThemes,
  },

  fonts: {
    body: monaSansFont,
    heading: ebGaramondFont,
    script: meriendaFont,
  },
});

/* -----------------------------------------------------
   Types
----------------------------------------------------- */

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
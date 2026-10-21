/**
 * Единственный источник правды переменных YKDesignSystem («Чертёж», оранжевый акцент).
 * Значения перенесены из sketches/shared/tokens.css и наброска 09 (раздел 02 — шрифты).
 * Отсюда генерируются dist/tokens.css, dist/index.js и Swift-файл YKTokens.
 */

export type ColorName =
  | "bg" | "surface" | "surface2" | "surface3" | "sidebar"
  | "text" | "muted" | "faint" | "border" | "borderStrong"
  | "ink" | "onInk"
  | "accent" | "accentText" | "accentSoft"
  | "danger" | "dangerSoft"
  | "success" | "successSoft";

export type ThemeName = "light" | "dark";
export type ColorPalette = Record<ColorName, string>;

/** Один слой тени: смещение, размытие и растяжение в px, цвет в CSS. */
export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export type FontFamilyName = "sans" | "mono";

export interface TextStyle {
  family: FontFamilyName;
  size: number;
  weight: number;
  /** Разрядка в em: отрицательная — плотнее, положительная — шире. */
  letterSpacing: number;
  lineHeight?: number;
  uppercase?: boolean;
}

export type TextStyleName = "display" | "title" | "heading" | "body" | "small" | "label" | "number";

const light: ColorPalette = {
  bg: "#FFFFFF", surface: "#FFFFFF", surface2: "#F4F4F3", surface3: "#EBEBE9", sidebar: "#FAFAF9",
  text: "#141414", muted: "#6E6E6B", faint: "#A3A3A0", border: "#E9E9E6", borderStrong: "#D6D6D2",
  ink: "#141414", onInk: "#FFFFFF",
  accent: "#EE6A3C", accentText: "#BE4824", accentSoft: "#FCEBE3",
  // Ошибка — холоднее и темнее акцента, чтобы не путать «важно» и «сломалось»
  danger: "#C8283A", dangerSoft: "#FBE7E9",
  success: "#1E8A55", successSoft: "#E3F4EA",
};

const dark: ColorPalette = {
  bg: "#0F0F0F", surface: "#161616", surface2: "#222222", surface3: "#2C2C2C", sidebar: "#121212",
  text: "#F2F2F0", muted: "#9B9B97", faint: "#5E5E5B", border: "#262626", borderStrong: "#3A3A3A",
  ink: "#F2F2F0", onInk: "#0F0F0F",
  accent: "#F27D52", accentText: "#F7A07E", accentSoft: "#3A2219",
  danger: "#FF5C6C", dangerSoft: "#3D1A1E",
  success: "#4CC88A", successSoft: "#16301F",
};

export const tokens = {
  color: { light, dark } satisfies Record<ThemeName, ColorPalette>,

  /** Тень всплывающих слоёв (диалог, меню, лист). Своя для каждой темы. */
  shadow: {
    pop: {
      light: [
        { x: 0, y: 12, blur: 32, spread: 0, color: "rgba(0,0,0,.12)" },
        { x: 0, y: 2, blur: 6, spread: 0, color: "rgba(0,0,0,.06)" },
      ],
      dark: [
        { x: 0, y: 12, blur: 32, spread: 0, color: "rgba(0,0,0,.5)" },
        { x: 0, y: 0, blur: 0, spread: 1, color: "#2A2A2A" },
      ],
    } satisfies Record<ThemeName, ShadowLayer[]>,
  },

  /** Радиусы углов в px: карточки — lg, кнопки и поля — md. */
  radius: { sm: 6, md: 10, lg: 12, xl: 16 },

  easing: { out: "cubic-bezier(.22, 1, .36, 1)" },

  fontFamily: {
    sans: 'system-ui, -apple-system, "SF Pro Text", "Inter", sans-serif',
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
  } satisfies Record<FontFamilyName, string>,

  /** Шкала шрифта. Моноширинный — только метки и цифры. */
  text: {
    display: { family: "sans", size: 30, weight: 600, letterSpacing: -0.025, lineHeight: 1.1 },
    title: { family: "sans", size: 22, weight: 600, letterSpacing: -0.02 },
    heading: { family: "sans", size: 17, weight: 600, letterSpacing: -0.01 },
    body: { family: "sans", size: 15, weight: 400, letterSpacing: 0, lineHeight: 1.5 },
    small: { family: "sans", size: 13, weight: 400, letterSpacing: 0 },
    label: { family: "mono", size: 11, weight: 400, letterSpacing: 0.08, uppercase: true },
    number: { family: "mono", size: 24, weight: 500, letterSpacing: -0.02 },
  } satisfies Record<TextStyleName, TextStyle>,

  /** Шкала отступов в px (шаг 4). Ключ — номер шага. */
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
} as const;

export type Tokens = typeof tokens;

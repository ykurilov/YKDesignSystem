import { kebabCase } from "./naming.js";
import type { ColorPalette, ShadowLayer, ThemeName, Tokens } from "./tokens.js";

const PREFIX = "--yk-";

/** Полный tokens.css: светлая тема в :root, тёмная — по data-theme и по системной настройке. */
export function renderTokensCss(tokens: Tokens): string {
  const lightVars = [...themeVariables(tokens, "light"), ...sharedVariables(tokens)];
  const darkVars = themeVariables(tokens, "dark");
  return [
    "/* Сгенерировано @ykurilov/ds-tokens. Не править вручную. */",
    rule(":root", lightVars),
    rule('[data-theme="dark"]', darkVars),
    "@media (prefers-color-scheme: dark) {",
    indent(rule(':root:not([data-theme="light"])', darkVars)),
    "}",
    "",
    "/* Метка «Чертежа»: моноширинный капс — только для меток и цифр, не для текста */",
    rule(".yk-mono-label", [
      "font-family: var(--yk-font-mono)",
      `font-size: ${tokens.text.label.size}px`,
      `letter-spacing: ${em(tokens.text.label.letterSpacing)}`,
      "text-transform: uppercase",
      "color: var(--yk-muted)",
    ]),
    rule(".yk-mono-num", ["font-family: var(--yk-font-mono)", "font-variant-numeric: tabular-nums"]),
  ].join("\n") + "\n";
}

function themeVariables(tokens: Tokens, theme: ThemeName): string[] {
  const palette: ColorPalette = tokens.color[theme];
  return [
    ...Object.entries(palette).map(([name, value]) => variable(kebabCase(name), value)),
    variable("shadow-pop", shadow(tokens.shadow.pop[theme])),
  ];
}

function sharedVariables(tokens: Tokens): string[] {
  return [
    ...Object.entries(tokens.radius).map(([name, px]) => variable(`radius-${name}`, `${px}px`)),
    ...Object.entries(tokens.space).map(([step, px]) => variable(`space-${step}`, `${px}px`)),
    ...Object.entries(tokens.studio).map(([name, value]) => variable(`studio-${kebabCase(name)}`, name === "bodyLineHeight" ? String(value) : `${value}px`)),
    variable("ease-out", tokens.easing.out),
    ...Object.entries(tokens.fontFamily).map(([name, stack]) => variable(`font-${name}`, stack)),
    ...Object.entries(tokens.text).flatMap(([name, style]) => {
      const vars = [
        variable(`text-${name}-size`, `${style.size}px`),
        variable(`text-${name}-weight`, String(style.weight)),
        variable(`text-${name}-tracking`, em(style.letterSpacing)),
      ];
      if ("lineHeight" in style) vars.push(variable(`text-${name}-line-height`, String(style.lineHeight)));
      return vars;
    }),
  ];
}

function variable(name: string, value: string): string {
  return `${PREFIX}${name}: ${value}`;
}

function shadow(layers: readonly ShadowLayer[]): string {
  return layers
    .map(({ x, y, blur, spread, color }) => [x, y, blur, ...(spread ? [spread] : [])].map(px).join(" ") + ` ${color}`)
    .join(", ");
}

function px(value: number): string {
  return value === 0 ? "0" : `${value}px`;
}

/** 0.08 → .08em, -0.025 → -.025em, 0 → 0 */
function em(value: number): string {
  return value === 0 ? "0" : `${value}`.replace(/^(-?)0\./, "$1.") + "em";
}

function rule(selector: string, declarations: string[]): string {
  return `${selector} {\n${declarations.map((d) => `  ${d};`).join("\n")}\n}`;
}

function indent(text: string): string {
  return text.split("\n").map((line) => `  ${line}`).join("\n");
}

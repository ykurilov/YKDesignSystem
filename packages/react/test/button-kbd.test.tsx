import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { tokens, type ColorPalette, type ThemeName } from "@ykurilov/ds-tokens";
import { contrastRatio } from "../../tokens/src/contrast.js";

const css = readFileSync(resolve(process.cwd(), "src/button/button.css"), "utf8");
const kbdOpacity = Number(/\.yk-button__kbd\s*\{[^}]*opacity:\s*([\d.]+)/.exec(css)?.[1]);

/** Цвет `fg` с непрозрачностью `alpha` поверх `bg` — как его видит глаз. */
function blend(fg: string, bg: string, alpha: number): string {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [f, b] = [channels(fg), channels(bg)];
  return "#" + f.map((v, i) => Math.round(v * alpha + b[i]! * (1 - alpha)).toString(16).padStart(2, "0")).join("");
}

/** Фон каждого вида кнопки в покое и под курсором (как в button.css) и цвет её текста. */
function buttonSurfaces(p: ColorPalette): Array<[string, string, string]> {
  return [
    ["primary", p.onInk, p.ink],
    ["primary:hover", p.onInk, blend(p.ink, p.bg, 0.85)],
    ["danger", p.onDanger, p.danger],
    ["danger:hover", p.onDanger, blend(p.danger, "#000000", 0.88)],
    ["secondary", p.text, p.surface2],
    ["secondary:hover", p.text, p.surface3],
  ];
}

describe("подсказка клавиши на кнопке читается (≥ 4.5)", () => {
  it("прозрачность найдена в стилях", () => {
    expect(kbdOpacity).toBeGreaterThan(0);
  });

  for (const theme of ["light", "dark"] as ThemeName[]) {
    for (const [name, text, surface] of buttonSurfaces(tokens.color[theme])) {
      it(`${theme}: ${name}`, () => {
        expect(contrastRatio(blend(text, surface, kbdOpacity), surface)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

import { describe, expect, it } from "vitest";
import { tokens, type ColorName, type ThemeName } from "../src/index.js";
import { contrastRatio } from "../src/contrast.js";

describe("contrastRatio", () => {
  it("чёрный на белом — 21, одинаковые цвета — 1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });
});

const READABLE_PAIRS: Array<[ColorName, ColorName]> = [
  ["text", "bg"],
  ["muted", "bg"],
  ["onInk", "ink"],
  ["accentText", "bg"],
  ["onDanger", "danger"],
];
const THEMES: ThemeName[] = ["light", "dark"];

describe("контраст текста не ниже 4.5", () => {
  for (const theme of THEMES) {
    for (const [fg, bg] of READABLE_PAIRS) {
      it(`${theme}: ${fg} на ${bg}`, () => {
        const palette = tokens.color[theme];
        expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

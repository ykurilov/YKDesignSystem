import { describe, expect, it } from "vitest";
import { tokens } from "../src/index.js";

const HEX = /^#[0-9A-F]{6}$/;

describe("переменные", () => {
  it("каждый цвет есть в обеих темах", () => {
    const lightNames = Object.keys(tokens.color.light).sort();
    const darkNames = Object.keys(tokens.color.dark).sort();
    expect(darkNames).toEqual(lightNames);
    expect(lightNames).toHaveLength(19);
  });

  it("все цвета — шестизначный hex", () => {
    for (const palette of [tokens.color.light, tokens.color.dark]) {
      for (const value of Object.values(palette)) expect(value).toMatch(HEX);
    }
  });

  it("тень есть в обеих темах", () => {
    expect(tokens.shadow.pop.light.length).toBeGreaterThan(0);
    expect(tokens.shadow.pop.dark.length).toBeGreaterThan(0);
  });

  it("радиусы, шрифт и отступы как в наброске", () => {
    expect(tokens.radius).toEqual({ sm: 6, md: 10, lg: 12, xl: 16 });
    expect(Object.values(tokens.space)).toEqual([4, 8, 12, 16, 20, 24, 32, 40]);
    const sizes = Object.fromEntries(Object.entries(tokens.text).map(([k, v]) => [k, v.size]));
    expect(sizes).toEqual({ display: 30, title: 22, heading: 17, body: 15, small: 13, label: 11, number: 24 });
    expect(tokens.text.label).toMatchObject({ family: "mono", uppercase: true, letterSpacing: 0.08 });
    expect(tokens.text.number.family).toBe("mono");
  });
});

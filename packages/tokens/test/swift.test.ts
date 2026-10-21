import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tokens } from "../src/index.js";
import { renderTokensFixture, renderTokensSwift, SWIFT_FIXTURE_PATH, SWIFT_TOKENS_PATH } from "../src/swift.js";

const swift = renderTokensSwift(tokens);

function hasSwiftCompiler(): boolean {
  try {
    execFileSync("swiftc", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe("Tokens.swift", () => {
  it("объявляет enum YKTokens с подключением SwiftUI", () => {
    expect(swift).toContain("import SwiftUI");
    expect(swift).toContain("public enum YKTokens {");
  });

  it("содержит каждый цвет парой светлый/тёмный", () => {
    for (const [name, lightHex] of Object.entries(tokens.color.light)) {
      const darkHex = tokens.color.dark[name as keyof typeof tokens.color.dark];
      const hex = (v: string) => `0x${v.slice(1).toUpperCase()}`;
      expect(swift).toContain(`public static let ${name} = adaptive(light: ${hex(lightHex)}, dark: ${hex(darkHex)})`);
    }
  });

  it("цвет подстраивается под тему через dynamic provider", () => {
    expect(swift).toContain("UIColor { traits in");
    expect(swift).toContain("NSColor(name: nil) { appearance in");
  });

  it("радиусы, отступы и размеры шрифта — константы", () => {
    expect(swift).toContain("public static let md: CGFloat = 10");
    expect(swift).toContain("public static let s4: CGFloat = 16");
    expect(swift).toContain("public static let display: CGFloat = 30");
    expect(swift).toContain("public static let label: CGFloat = 11");
  });

  it("роли шрифта — полные стили: семейство, вес, разрядка, высота строки, капс", () => {
    expect(swift).toContain("public enum Text {");
    expect(swift).toContain(
      "public static let display = YKTextStyle(family: .sans, size: 30, weight: 600, letterSpacing: -0.025, lineHeight: 1.1, uppercase: false)",
    );
    expect(swift).toContain(
      "public static let label = YKTextStyle(family: .mono, size: 11, weight: 400, letterSpacing: 0.08, lineHeight: nil, uppercase: true)",
    );
  });

  it("тень всплывающих слоёв — слои для каждой темы", () => {
    expect(swift).toContain("public enum Shadow {");
    expect(swift).toContain("YKShadowLayer(x: 0, y: 12, blur: 32, spread: 0, color: YKRGBA(red: 0, green: 0, blue: 0, alpha: 0.12))");
    expect(swift).toContain("YKShadowLayer(x: 0, y: 0, blur: 0, spread: 1, color: YKRGBA(red: 42, green: 42, blue: 42, alpha: 1))");
  });

  it("плавность — кривая Безье", () => {
    expect(swift).toContain("public static let out = YKCubicBezier(x1: 0.22, y1: 1, x2: 0.36, y2: 1)");
  });

  it("скобки сбалансированы", () => {
    const opens = swift.split("{").length;
    const closes = swift.split("}").length;
    expect(opens).toBe(closes);
  });

  it("сгенерированный файл в репозитории совпадает с источником", () => {
    expect(existsSync(SWIFT_TOKENS_PATH), "запустите pnpm build").toBe(true);
    expect(readFileSync(SWIFT_TOKENS_PATH, "utf8")).toBe(swift);
  });

  it("JSON-образец для тестов Swift совпадает с источником", () => {
    expect(existsSync(SWIFT_FIXTURE_PATH), "запустите pnpm build").toBe(true);
    const fixture = readFileSync(SWIFT_FIXTURE_PATH, "utf8");
    expect(fixture).toBe(renderTokensFixture(tokens));
    expect(JSON.parse(fixture).color.light.accent).toBe(tokens.color.light.accent);
  });

  it.skipIf(!hasSwiftCompiler())("компилируется swiftc", () => {
    const dir = mkdtempSync(join(tmpdir(), "yk-swift-"));
    const file = join(dir, "Tokens.swift");
    writeFileSync(file, swift);
    execFileSync("swiftc", ["-typecheck", file], { stdio: "pipe" });
  }, 120_000);
});

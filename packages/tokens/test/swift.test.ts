import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tokens } from "../src/index.js";
import { renderTokensSwift, SWIFT_TOKENS_PATH } from "../src/swift.js";

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

  it("скобки сбалансированы", () => {
    const opens = swift.split("{").length;
    const closes = swift.split("}").length;
    expect(opens).toBe(closes);
  });

  it("сгенерированный файл в репозитории совпадает с источником", () => {
    expect(existsSync(SWIFT_TOKENS_PATH), "запустите pnpm build").toBe(true);
    expect(readFileSync(SWIFT_TOKENS_PATH, "utf8")).toBe(swift);
  });

  it.skipIf(!hasSwiftCompiler())("компилируется swiftc", () => {
    const dir = mkdtempSync(join(tmpdir(), "yk-swift-"));
    const file = join(dir, "Tokens.swift");
    writeFileSync(file, swift);
    execFileSync("swiftc", ["-typecheck", file], { stdio: "pipe" });
  }, 120_000);
});

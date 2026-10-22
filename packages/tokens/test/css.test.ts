import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { tokens } from "../src/index.js";
import { renderTokensCss } from "../src/css.js";

const css = renderTokensCss(tokens);

/** Тело первого блока с данным селектором. */
function block(selector: string, source = css): string {
  const start = source.indexOf(`${selector} {`);
  expect(start, `нет блока ${selector}`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`незакрытый блок ${selector}`);
}

describe("tokens.css", () => {
  it("объявляет все токены, на которые ссылается CSS Студии", () => {
    const consumer = readFileSync(new URL("../../react/src/studio/studio.css", import.meta.url), "utf8");
    const references = new Set([...consumer.matchAll(/var\((--yk-[\w-]+)/g)].map(match => match[1]));
    for (const name of references) expect(block(":root"), `не объявлен ${name}`).toContain(`${name}:`);
  });
  it("светлая тема в :root с префиксом --yk-", () => {
    const root = block(":root");
    expect(root).toContain("--yk-bg: #FFFFFF;");
    expect(root).toContain("--yk-surface-2: #F4F4F3;");
    expect(root).toContain("--yk-border-strong: #D6D6D2;");
    expect(root).toContain("--yk-on-ink: #FFFFFF;");
    expect(root).toContain("--yk-accent: #EE6A3C;");
    expect(root).toContain("--yk-radius-md: 10px;");
    expect(root).toContain("--yk-space-4: 16px;");
    expect(root).toContain("--yk-ease-out: cubic-bezier(.22, 1, .36, 1);");
    expect(root).toContain("--yk-font-mono:");
    expect(root).toContain("--yk-text-display-size: 30px;");
    expect(root).toContain("--yk-shadow-pop: 0 12px 32px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);");
  });

  it("тёмная тема по атрибуту и автоматически по системной настройке", () => {
    const manual = block('[data-theme="dark"]');
    expect(manual).toContain("--yk-bg: #0F0F0F;");
    expect(manual).toContain("--yk-accent: #F27D52;");
    expect(manual).toContain("--yk-shadow-pop: 0 12px 32px rgba(0,0,0,.5), 0 0 0 1px #2A2A2A;");

    const media = block("@media (prefers-color-scheme: dark)");
    const auto = block(':root:not([data-theme="light"])', media);
    expect(auto).toContain("--yk-bg: #0F0F0F;");
  });

  it("каждый цвет объявлен в каждой теме", () => {
    const blocks = [block(":root"), block('[data-theme="dark"]'), block(':root:not([data-theme="light"])')];
    for (const name of Object.keys(tokens.color.light)) {
      const varName = `--yk-${name.replace(/([A-Z]|\d+)/g, "-$1").toLowerCase()}:`;
      for (const b of blocks) expect(b).toContain(varName);
    }
  });

  it("служебные классы меток и цифр", () => {
    const label = block(".yk-mono-label");
    expect(label).toContain("font-family: var(--yk-font-mono)");
    expect(label).toContain("text-transform: uppercase");
    expect(label).toContain("letter-spacing: .08em");
    expect(label).toContain("font-size: 11px");
    const num = block(".yk-mono-num");
    expect(num).toContain("font-variant-numeric: tabular-nums");
  });
});

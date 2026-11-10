// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dist = (name: string) => fileURLToPath(new URL(`../dist/${name}`, import.meta.url));

describe("серверный подпуть theme-script", () => {
  it("собранный файл без \"use client\" и без React", () => {
    expect(existsSync(dist("theme-script.js"))).toBe(true);
    const code = readFileSync(dist("theme-script.js"), "utf8");
    expect(code).not.toMatch(/use client/);
    expect(code).not.toMatch(/from\s*["']react/);
  });

  it("импортируется на сервере и отдаёт themeScript", async () => {
    const mod = await import(dist("theme-script.js"));
    expect(mod.themeScript()).toContain("yk-theme");
    expect(mod.DEFAULT_THEME_STORAGE_KEY).toBe("yk-theme");
  });

  it("package.json публикует подпуть", () => {
    const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"));
    expect(pkg.exports["./theme-script"].import).toBe("./dist/theme-script.js");
  });

  it("основной экспорт остался клиентским", () => {
    expect(readFileSync(dist("index.js"), "utf8").startsWith('"use client"')).toBe(true);
  });
});

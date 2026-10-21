/** Генерирует dist/tokens.css, Swift-файл и JSON-образец для тестов Swift из src/tokens.ts. JS и .d.ts собирает tsc. */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTokensCss } from "../src/css.js";
import { renderTokensFixture, renderTokensSwift, SWIFT_FIXTURE_PATH, SWIFT_TOKENS_PATH } from "../src/swift.js";
import { tokens } from "../src/tokens.js";

const CSS_PATH = fileURLToPath(new URL("../dist/tokens.css", import.meta.url));

for (const [path, content] of [
  [CSS_PATH, renderTokensCss(tokens)],
  [SWIFT_TOKENS_PATH, renderTokensSwift(tokens)],
  [SWIFT_FIXTURE_PATH, renderTokensFixture(tokens)],
] as const) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`записано: ${path}`);
}

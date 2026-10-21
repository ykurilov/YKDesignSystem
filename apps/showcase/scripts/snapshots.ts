// Снимки витрины в светлой и тёмной теме: pnpm snapshots [адрес] (по умолчанию — свой сервер vite preview)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../snapshots/", import.meta.url));
const url = process.argv[2] ?? "http://localhost:4173/";

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const theme of ["light", "dark"] as const) {
  const page = await browser.newPage({ viewport: { width: 1320, height: 900 }, deviceScaleFactor: 2, colorScheme: theme });
  await page.goto(url);
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  // Ждём шрифты и один кадр сфер после смены темы
  await page.evaluate(() => document.fonts.ready.then(() => new Promise(requestAnimationFrame)));
  const file = `${outDir}showcase-${theme}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(file);
  await page.close();
}
await browser.close();

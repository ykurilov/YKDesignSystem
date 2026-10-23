// Проверка частей чата в витрине: общая колонка, скругление итога, обе темы и телефон.
import { chromium } from "playwright";
import { preview as vitePreview } from "vite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
mkdirSync(`${cwd}snapshots/`, { recursive: true });
const preview = await vitePreview({ root: cwd, preview: { host: "127.0.0.1", port: 5193, strictPort: true } });
const browser = await chromium.launch();
const errors: string[] = [];
const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); console.log(`ок ${message}`); };
try {
  for (const [theme, width] of [["light", 1280], ["dark", 1280], ["light", 390]] as const) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
    page.on("pageerror", e => errors.push(e.message));
    await page.goto("http://127.0.0.1:5193/");
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    const demo = page.locator(".sc-chat-parts");
    await demo.scrollIntoViewIfNeeded();
    const geometry = await demo.evaluate(root => {
      const [header, card] = [".yk-chat-header__inner", ".yk-completion"].map(selector => {
        const box = root.querySelector(selector)!.getBoundingClientRect(); return [Math.round(box.left), Math.round(box.right)];
      });
      return { header, card,
        radius: getComputedStyle(root.querySelector(".yk-completion")!).borderRadius,
        overflow: [...root.querySelectorAll("*")].filter(el => el.getBoundingClientRect().right > root.getBoundingClientRect().right + 1).map(el => el.className).slice(0, 5) };
    });
    check(geometry.header.join() === geometry.card.join(), `${theme} ${width}: шапка и итог в одной колонке`);
    check(geometry.radius === "20px", `${theme} ${width}: скругление итога 20px`);
    check(geometry.overflow.length === 0 || (console.log(geometry.overflow), false), `${theme} ${width}: без горизонтальной прокрутки`);
    await demo.screenshot({ path: `${cwd}snapshots/chat-parts-${theme}-${width}.png` });
    await page.close();
  }
  check(errors.length === 0, "без ошибок на странице");
} finally {
  await browser.close();
  await new Promise<void>(resolve => preview.httpServer.close(() => resolve()));
}

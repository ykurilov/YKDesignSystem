// Проверка геометрии, независимой прокрутки и мобильного Sheet настоящих компонентов.
import { chromium, type Page } from "playwright";
import { preview as vitePreview } from "vite";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const out = `${cwd}snapshots/`;
mkdirSync(out, { recursive: true });
const preview = await vitePreview({ root: cwd, preview: { host: "127.0.0.1", port: 5192, strictPort: true } });
const browser = await chromium.launch();
const errors: string[] = [];
const check = (ok: boolean, message: string) => { if (!ok) throw new Error(message); console.log(`ок ${message}`); };
async function ready(page: Page) {
  for (let n = 0; n < 40; n++) {
    try { const response = await page.goto("http://127.0.0.1:5192/"); if (response?.ok()) return; } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error("Витрина не запустилась");
}
try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on("pageerror", e => errors.push(e.message));
    await ready(page);
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    const studio = page.locator(".yk-studio");
    await studio.scrollIntoViewIfNeeded();
    const areas = studio.locator(".yk-scroll-area");
    check(await areas.count() === 2, `${theme}: две независимые области прокрутки`);
    for (const area of await areas.all()) {
      const result = await area.evaluate(el => {
        const css = getComputedStyle(el);
        const before = el.scrollTop;
        el.scrollTop = el.scrollHeight;
        return { gap: parseFloat(css.paddingInlineEnd), moved: el.scrollTop > before, overflow: el.scrollWidth > el.clientWidth, gutter: css.scrollbarGutter };
      });
      check(result.gap >= 16 && result.gutter.includes("stable"), `${theme}: gutter и 16px до текста`);
      check(result.moved && !result.overflow, `${theme}: прокрутка работает без горизонтального выхода`);
    }
    const footer = studio.locator(".sc-studio-footer");
    const end = await footer.boundingBox(); const frame = await studio.boundingBox();
    check(!!end && !!frame && end.y + end.height <= frame.y + frame.height, `${theme}: нижняя панель внутри композиции`);
    await studio.screenshot({ path: `${out}studio-${theme}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await studio.scrollIntoViewIfNeeded();
    const trigger = studio.getByRole("button", { name: "Журнал", exact: true });
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Журнал", exact: true });
    await sheet.waitFor();
    check(await sheet.getByRole("region", { name: "События журнала" }).count() === 1, `${theme}: один экземпляр журнала в мобильном Sheet`);
    await page.screenshot({ path: `${out}studio-sheet-${theme}.png` });
    await page.keyboard.press("Escape");
    await sheet.waitFor({ state: "detached" });
    check(await trigger.evaluate(el => el === document.activeElement), `${theme}: Esc возвращает фокус`);
    check(await studio.evaluate(el => el.getBoundingClientRect().right <= innerWidth && el.scrollWidth <= el.clientWidth), `${theme}: Студия помещается по ширине телефона`);
    await page.close();
  }
  check(errors.length === 0, "нет ошибок JavaScript");
} finally {
  await browser.close();
  preview.httpServer.closeAllConnections();
  await new Promise<void>((resolve, reject) => preview.httpServer.close(error => error ? reject(error) : resolve()));
}

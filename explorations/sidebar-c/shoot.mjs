// Снимки прототипа: node shoot.mjs (сервер на 5283 должен работать).
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../../apps/showcase/package.json", import.meta.url));
const { chromium } = require("playwright");
const out = fileURLToPath(new URL("./screenshots/", import.meta.url));
const base = "http://127.0.0.1:5283/";
const browser = await chromium.launch({ executablePath: `${homedir()}/.local/share/agent-browser/current/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing` });
const errors = [];
async function shot(name, query, size = { width: 1440, height: 900 }, before) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 2 });
  page.on("pageerror", e => errors.push(`${name}: ${e.message}`));
  page.on("console", m => m.type() === "error" && errors.push(`${name}: ${m.text()}`));
  await page.goto(base + query); await page.waitForSelector(".ws-shell"); await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForSelector(".ws-shell");
  if (before) await before(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out + name + ".png" }); await page.close();
}
await shot("01-light-expanded", "?app=chat");
await shot("02-dark-expanded", "?app=chat&theme=dark");
await shot("03-light-collapsed", "?app=chat&view=collapsed");
await shot("04-phone-light", "?frame&app=chat&open", { width: 390, height: 844 });
await shot("05-admin-light-expanded", "?app=admin");
await shot("06-admin-dark-collapsed", "?app=admin&view=collapsed&theme=dark");
await shot("07-search-light", "?app=chat", undefined, async p => { await p.keyboard.press("Meta+k"); await p.keyboard.type("эфир"); });
await shot("08-account-menu-dark", "?app=admin&theme=dark", undefined, async p => { await p.click(".ws-account"); });
await shot("09-phone-dark-admin", "?frame&app=admin&open&theme=dark", { width: 390, height: 844 });
await shot("account-email", "?app=chat&account=email");
await shot("account-name-only", "?app=chat&account=name");
await shot("account-plan", "?app=chat&account=plan");
await browser.close();
console.log(errors.length ? errors.join("\n") : "без ошибок в консоли");

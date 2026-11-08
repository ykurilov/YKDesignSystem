// Снимки экрана: node shoot.mjs (сервер на 5281 должен быть запущен)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../../apps/showcase/package.json", import.meta.url));
const { chromium } = require("playwright");
const exe = process.env.HOME + "/.local/share/agent-browser/current/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const out = fileURLToPath(new URL("./screenshots/", import.meta.url));
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const shots = [
  ["light-expanded", "?theme=light&view=expanded", 1440, 900],
  ["dark-expanded", "?theme=dark&view=expanded", 1440, 900],
  ["light-collapsed", "?theme=light&view=collapsed", 1440, 900],
  ["dark-collapsed", "?theme=dark&view=collapsed", 1440, 900],
  ["account-email", "?theme=light&view=expanded&account=email", 1440, 900],
  ["account-name-only", "?theme=light&view=expanded&account=name", 1440, 900],
  ["account-plan", "?theme=light&view=expanded&account=plan", 1440, 900],
  ["sections-only-light", "?theme=light&view=expanded&app=sections", 1440, 900],
  ["sections-only-dark", "?theme=dark&view=expanded&app=sections", 1440, 900],
  ["sections-only-collapsed", "?theme=light&view=collapsed&app=sections", 1440, 900],
  ["sections-only-phone", "?frame&theme=light&app=sections&drawer", 390, 844],
  ["settings-theme", "?view=expanded&settings", 1440, 900],
  ["phone-closed", "?frame&theme=light", 390, 844],
  ["phone-open", "?frame&theme=light&drawer", 390, 844],
  ["phone-open-dark", "?frame&theme=dark&drawer", 390, 844],
];
for (const [name, q, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  page.on("pageerror", e => errors.push(name + ": " + e.message));
  page.on("console", m => m.type() === "error" && errors.push(name + ": " + m.text()));
  await page.goto("http://127.0.0.1:5281/" + q);
  await page.waitForSelector(".sb, .shell");
  await page.waitForTimeout(400);
  await page.screenshot({ path: out + name + ".png" });
  await page.close();
}
// Меню аккаунта и прокрутка середины
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:5281/?theme=light");
await page.waitForSelector(".sb");
const m = await page.evaluate(() => { const el = document.querySelector(".sb__middle"); el.scrollTop = 400; return { top: el.scrollTop, docScroll: document.scrollingElement.scrollHeight <= innerHeight }; });
console.log("middle scroll", m);
await page.click(".sb__account"); await page.waitForTimeout(300);
await page.screenshot({ path: out + "light-account-menu.png" });
await browser.close();
console.log(errors.length ? errors.join("\n") : "no errors");

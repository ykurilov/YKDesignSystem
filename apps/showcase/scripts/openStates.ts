// Живая проверка всплывающего: окно, меню (в т. ч. у правого и нижнего края) и шторка — кнопками и клавиатурой.
// pnpm open-states [адрес] — снимки открытых состояний в snapshots/open-*.png, при провале проверки — выход с ошибкой
import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../snapshots/", import.meta.url));
const url = process.argv[2] ?? "http://localhost:4173/";
mkdirSync(outDir, { recursive: true });

const failures: string[] = [];
const check = (ok: boolean, what: string) => {
  console.log(`${ok ? "ок " : "ПРОВАЛ"} ${what}`);
  if (!ok) failures.push(what);
};
const focusedName = (page: Page) => page.evaluate("document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim()") as Promise<string>;
const section = (page: Page) => page.locator("section[aria-labelledby=section-8]");
// Снимок только после конца анимаций: иначе окно, меню и шторка выходят полупрозрачными.
const shot = async (page: Page, name: string, theme: string) => {
  await page.evaluate("Promise.all(document.getAnimations().filter((a) => a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => {})))");
  await page.screenshot({ path: `${outDir}open-${name}-${theme}.png` });
};

const browser = await chromium.launch();
for (const theme of ["light", "dark"] as const) {
  const page = await browser.newPage({ viewport: { width: 1320, height: 800 }, deviceScaleFactor: 2, colorScheme: theme });
  await page.goto(url);
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  await page.evaluate("document.fonts.ready");
  await section(page).scrollIntoViewIfNeeded();
  console.log(`— ${theme}`);

  // Окно: открыть кнопкой, Tab по кругу, Esc, фокус вернулся
  const openDialog = page.getByRole("button", { name: "Окно", exact: true });
  await openDialog.click();
  check(await page.getByRole("dialog", { name: /Удалить/ }).isVisible(), "окно открылось");
  check((await focusedName(page)) === "Отмена", "в окне фокус на первой кнопке");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  check((await focusedName(page)) === "Отмена", "Tab в окне ходит по кругу");
  check((await page.evaluate("document.body.style.overflow")) === "hidden", "фон не прокручивается");
  await shot(page, "dialog", theme);
  await page.keyboard.press("Escape");
  check(!(await page.getByRole("dialog").count()), "Esc закрыл окно");
  check((await focusedName(page)) === "Окно", "фокус вернулся на «Окно»");

  // Шторка
  await page.getByRole("button", { name: "Шторка", exact: true }).click();
  check(await page.getByRole("dialog", { name: "Новый проект" }).isVisible(), "шторка открылась");
  check((await focusedName(page)) === "Название проекта", "в шторке фокус на поле (data-autofocus)");
  await shot(page, "sheet", theme);
  await page.mouse.click(600, 100);
  check(!(await page.getByRole("dialog").count()), "клик по фону закрыл шторку");

  // Меню: стрелки, Esc, Enter
  const menuButton = page.getByRole("button", { name: "Меню", exact: true });
  await menuButton.click();
  check(await page.getByRole("menu", { name: "Действия" }).isVisible(), "меню открылось");
  check((await focusedName(page)).startsWith("Переименовать"), "в меню фокус на первом пункте");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  check((await focusedName(page)).startsWith("Спросить агента"), "стрелка вниз двигает фокус");
  await shot(page, "menu", theme);
  await page.keyboard.press("Escape");
  check(!(await page.getByRole("menu").count()), "Esc закрыл меню");
  check((await focusedName(page)) === "Меню", "фокус вернулся на «Меню»");
  await menuButton.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  check(!(await page.getByRole("menu").count()), "Enter выбрал пункт и закрыл меню");

  // Меню у правого края: должно прижаться к правому краю кнопки и не вылезти за экран
  const edge = page.getByRole("button", { name: "Действия у края" });
  await edge.click();
  const rightBox = (await page.getByRole("menu").boundingBox())!;
  const edgeBox = (await edge.boundingBox())!;
  check(rightBox.x + rightBox.width <= 1320 && rightBox.x >= 0, "меню у правого края не вылезло за экран");
  check(Math.abs(rightBox.x + rightBox.width - (edgeBox.x + edgeBox.width)) < 1, "меню выровнено по правому краю кнопки");
  check(rightBox.y > edgeBox.y, "у верхней части экрана меню открыто вниз");
  await shot(page, "menu-right-edge", theme);
  await page.keyboard.press("Escape");

  // Меню у нижнего края: прокручиваем страницу, чтобы кнопка встала внизу окна
  await page.evaluate(`(() => { const b = document.querySelector('[aria-label="Действия у края"]'); const r = b.getBoundingClientRect(); window.scrollBy(0, r.bottom - (innerHeight - 24)); })()`);
  await edge.click();
  const upBox = (await page.getByRole("menu").boundingBox())!;
  const edgeBox2 = (await edge.boundingBox())!;
  check(upBox.y + upBox.height <= edgeBox2.y, "у нижнего края меню открылось вверх");
  check(upBox.y >= 0, "меню у нижнего края не вылезло за верх экрана");
  await shot(page, "menu-bottom-edge", theme);
  await page.keyboard.press("Escape");

  // Уведомление
  await section(page).scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Показать уведомление" }).click();
  check(await page.getByRole("status").filter({ hasText: "Проект удалён" }).first().isVisible(), "уведомление появилось");
  await shot(page, "toast", theme);
  await page.close();
}
await browser.close();
if (failures.length) {
  console.error(`\nПровалено проверок: ${failures.length}`);
  process.exit(1);
}

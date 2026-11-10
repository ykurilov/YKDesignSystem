// Без React и без "use client": этот файл можно вызывать из серверного layout (Next.js App Router).
import { tokens } from "@ykurilov/ds-tokens";

export type ThemePreference = "system" | "light" | "dark";
export const DEFAULT_THEME_STORAGE_KEY = "yk-theme";

const THEME_COLOR = { light: tokens.color.light.bg, dark: tokens.color.dark.bg };

/**
 * Строка для встроенного <script> в <head>: применяет сохранённую тему до первой отрисовки, без вспышки,
 * и красит <meta name="theme-color"> (без атрибута media) в фон действующей темы, в том числе при смене системной темы.
 * Если такой meta нет, скрипт её не создаёт.
 */
export function themeScript(storageKey: string = DEFAULT_THEME_STORAGE_KEY): string {
  return `try{var k=${JSON.stringify(storageKey)},c=${JSON.stringify(THEME_COLOR)},m=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)"),`
    + `p=function(){try{var t=localStorage.getItem(k);return t==="light"||t==="dark"?t:null}catch(e){return null}},`
    + `f=function(){var t=p()||(m&&m.matches?"dark":"light"),a=document.querySelectorAll('meta[name="theme-color"]');`
    + `for(var i=0;i<a.length;i++)if(!a[i].getAttribute("media"))a[i].setAttribute("content",c[t])},`
    + `t=p();if(t)document.documentElement.dataset.theme=t;f();`
    + `if(m&&m.addEventListener)m.addEventListener("change",function(){if(!p())f()})}catch(e){}`;
}

/** То же самое для кода на клиенте: покрасить строку статуса под выбранную тему. */
export function applyThemeColor(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  const effective = theme !== "system" ? theme
    : typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
    if (!meta.getAttribute("media")) meta.setAttribute("content", THEME_COLOR[effective]);
  });
}

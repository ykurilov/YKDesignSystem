import { useEffect, useSyncExternalStore } from "react";
import { RadioGroup, Radio } from "../radio/Radio.js";

import { applyThemeColor, DEFAULT_THEME_STORAGE_KEY, themeScript, type ThemePreference } from "./themeScript.js";

export { themeScript, DEFAULT_THEME_STORAGE_KEY, type ThemePreference };

const listeners = new Set<() => void>();
const isStored = (value: unknown): value is "light" | "dark" => value === "light" || value === "dark";

function read(storageKey: string): ThemePreference {
  try { const value = localStorage.getItem(storageKey); return isStored(value) ? value : "system"; } catch { return "system"; }
}
function apply(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  applyThemeColor(theme);
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

/** Выбор темы пользователем: общий для всех частей приложения, запоминается в localStorage. По умолчанию — как в системе. */
export function useThemePreference(storageKey: string = DEFAULT_THEME_STORAGE_KEY) {
  const theme = useSyncExternalStore(subscribe, () => read(storageKey), () => "system" as ThemePreference);
  useEffect(() => {
    apply(theme);
    if (theme !== "system" || typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeColor("system");
    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, [theme]);
  const setTheme = (next: ThemePreference) => {
    try { if (next === "system") localStorage.removeItem(storageKey); else localStorage.setItem(storageKey, next); } catch { /* тема применится до перезагрузки */ }
    apply(next);
    listeners.forEach(listener => listener());
  };
  return { theme, setTheme };
}

export interface ThemeSettingsProps {
  storageKey?: string;
  label?: string;
  labels?: Partial<Record<ThemePreference, string>>;
  className?: string;
}

/** Готовая часть экрана настроек: «Тема: Как в системе / Светлая / Тёмная». Кнопки темы вне настроек система не даёт. */
export function ThemeSettings({ storageKey, label = "Тема", labels, className }: ThemeSettingsProps) {
  const { theme, setTheme } = useThemePreference(storageKey);
  const text = { system: "Как в системе", light: "Светлая", dark: "Тёмная", ...labels };
  return (
    <RadioGroup label={label} value={theme} onValueChange={value => setTheme(value as ThemePreference)} className={className}>
      <Radio value="system">{text.system}</Radio>
      <Radio value="light">{text.light}</Radio>
      <Radio value="dark">{text.dark}</Radio>
    </RadioGroup>
  );
}

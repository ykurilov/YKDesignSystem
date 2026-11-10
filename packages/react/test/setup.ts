import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// В jsdom нет canvas: подменяем контекст рисования, чтобы видеть вызовы
export const canvasContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  globalAlpha: 1,
  fillStyle: "",
};
if (typeof HTMLCanvasElement !== "undefined") HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasContext) as never;

type ChangeListener = (event: { matches: boolean }) => void;
const media = { reduce: false, dark: false, listeners: new Map<string, Set<ChangeListener>>() };

function matchesNow(query: string): boolean {
  if (query.includes("prefers-reduced-motion")) return media.reduce;
  if (query.includes("prefers-color-scheme: dark")) return media.dark;
  return false;
}

function installMatchMedia() {
  media.listeners.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return matchesNow(query); },
    media: query,
    addEventListener: (_type: string, listener: ChangeListener) => {
      media.listeners.set(query, (media.listeners.get(query) ?? new Set()).add(listener));
    },
    removeEventListener: (_type: string, listener: ChangeListener) => { media.listeners.get(query)?.delete(listener); },
  }));
}

function fireMediaChange(part: string) {
  media.listeners.forEach((listeners, query) => {
    if (query.includes(part)) listeners.forEach((listener) => listener({ matches: matchesNow(query) }));
  });
}

/** Настройка «уменьшить движение» в системе. */
export function mockReducedMotion(reduce: boolean) {
  media.reduce = reduce;
  installMatchMedia();
}

/** Пользователь переключил «уменьшить движение» при открытой странице. */
export function changeReducedMotion(reduce: boolean) {
  media.reduce = reduce;
  fireMediaChange("prefers-reduced-motion");
}

/** Система сменила светлую тему на тёмную или обратно при открытой странице. */
export function changeSystemDark(dark: boolean) {
  media.dark = dark;
  fireMediaChange("prefers-color-scheme");
}

mockReducedMotion(false);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

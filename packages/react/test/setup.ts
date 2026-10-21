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
HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasContext) as never;

/** Настройка «уменьшить движение» в системе. */
export function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

mockReducedMotion(false);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sphere } from "../src/index.js";
import { canvasContext, changeReducedMotion, changeSystemDark, mockReducedMotion } from "./setup.js";

let frames: Map<number, FrameRequestCallback>;
let nextId: number;
const requestFrame = vi.fn((cb: FrameRequestCallback) => {
  frames.set(++nextId, cb);
  return nextId;
});
const cancelFrame = vi.fn((id: number) => frames.delete(id));

function runFrame(time = 16) {
  const pending = [...frames.entries()];
  frames.clear();
  act(() => pending.forEach(([, cb]) => cb(time)));
}

beforeEach(() => {
  frames = new Map();
  nextId = 0;
  vi.stubGlobal("requestAnimationFrame", requestFrame);
  vi.stubGlobal("cancelAnimationFrame", cancelFrame);
  vi.stubGlobal("devicePixelRatio", 3);
  mockReducedMotion(false);
});

afterEach(() => {
  frames.clear();
});

describe("Sphere", () => {
  it("по умолчанию декоративная: скрыта от экранного диктора и без роли", () => {
    const { container } = render(<Sphere />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("с подписью — область статуса с этой подписью", () => {
    render(<Sphere label="Агент пишет ответ" />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Агент пишет ответ");
    expect(status).not.toHaveAttribute("aria-hidden");
  });

  it("чёткая на Retina: холст в пикселях экрана, размер на странице — size", () => {
    const { container } = render(<Sphere size={24} />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(72);
    expect(canvas.height).toBe(72);
    expect(canvas.style.width).toBe("24px");
    expect(canvas.style.height).toBe("24px");
  });

  it("при «уменьшить движение» рисует один кадр и не запускает анимацию", () => {
    mockReducedMotion(true);
    render(<Sphere size={16} />);
    expect(requestFrame).not.toHaveBeenCalled();
    expect(canvasContext.arc).toHaveBeenCalled();
  });

  it("все сферы страницы крутит один общий цикл анимации", () => {
    render(
      <>
        <Sphere />
        <Sphere size={48} />
        <Sphere size={12} />
      </>,
    );
    expect(requestFrame).toHaveBeenCalledTimes(1);
    runFrame();
    expect(requestFrame).toHaveBeenCalledTimes(2);
    expect(frames.size).toBe(1);
  });

  it("после размонтирования последней сферы цикл останавливается", () => {
    const first = render(<Sphere />);
    const second = render(<Sphere />);
    first.unmount();
    expect(cancelFrame).not.toHaveBeenCalled();
    second.unmount();
    expect(cancelFrame).toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it("цвет из пропа color используется для точек", () => {
    render(<Sphere color="#123456" />);
    runFrame();
    expect(canvasContext.fillStyle).toBe("#123456");
  });

  describe("цвет и тема", () => {
    const accents = { light: "#EE6A3C", dark: "#F27D52" } as const;
    let computedStyle: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      document.documentElement.removeAttribute("data-theme");
      const real = window.getComputedStyle.bind(window);
      computedStyle = vi.spyOn(window, "getComputedStyle").mockImplementation((element: Element) => {
        const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        return Object.assign(real(element), {
          color: "rgb(1, 2, 3)",
          getPropertyValue: (name: string) => (name === "--yk-accent" ? accents[theme] : ""),
        });
      });
    });
    afterEach(() => {
      computedStyle.mockRestore();
      document.documentElement.removeAttribute("data-theme");
    });

    const flushObservers = () => act(async () => { await Promise.resolve(); });

    it("стиль читается один раз при появлении, а не в каждом кадре", () => {
      render(<Sphere />);
      const afterMount = computedStyle.mock.calls.length;
      runFrame(16);
      runFrame(32);
      runFrame(48);
      expect(canvasContext.fillStyle).toBe(accents.light);
      expect(computedStyle.mock.calls.length).toBe(afterMount);
    });

    it("смена data-theme на странице перекрашивает сферу без перезагрузки", async () => {
      render(<Sphere />);
      runFrame();
      expect(canvasContext.fillStyle).toBe(accents.light);
      document.documentElement.dataset.theme = "dark";
      await flushObservers();
      runFrame();
      expect(canvasContext.fillStyle).toBe(accents.dark);
    });

    it("смена системной темы тоже перекрашивает", async () => {
      render(<Sphere />);
      runFrame();
      document.documentElement.dataset.theme = "dark";
      changeSystemDark(true);
      runFrame();
      expect(canvasContext.fillStyle).toBe(accents.dark);
    });

    it("при «уменьшить движение» смена темы перерисовывает единственный кадр", async () => {
      mockReducedMotion(true);
      render(<Sphere />);
      expect(canvasContext.fillStyle).toBe(accents.light);
      document.documentElement.dataset.theme = "dark";
      await flushObservers();
      expect(canvasContext.fillStyle).toBe(accents.dark);
    });

    it("currentColor следует за цветом текста после смены темы", async () => {
      render(<Sphere color="currentColor" />);
      runFrame();
      expect(canvasContext.fillStyle).toBe("rgb(1, 2, 3)");
    });

    it("после размонтирования за темой больше не следим", async () => {
      const { unmount } = render(<Sphere />);
      unmount();
      const calls = computedStyle.mock.calls.length;
      document.documentElement.dataset.theme = "dark";
      await flushObservers();
      changeSystemDark(true);
      expect(computedStyle.mock.calls.length).toBe(calls);
    });
  });

  describe("«уменьшить движение» на лету", () => {
    it("включили при открытой странице — анимация встаёт, остаётся один кадр", () => {
      render(<Sphere />);
      expect(frames.size).toBe(1);
      canvasContext.arc.mockClear();
      changeReducedMotion(true);
      expect(cancelFrame).toHaveBeenCalled();
      expect(frames.size).toBe(0);
      expect(canvasContext.arc).toHaveBeenCalled();
    });

    it("выключили — анимация снова идёт", () => {
      mockReducedMotion(true);
      render(<Sphere />);
      expect(requestFrame).not.toHaveBeenCalled();
      changeReducedMotion(false);
      expect(frames.size).toBe(1);
      runFrame();
      expect(frames.size).toBe(1);
    });

    it("после размонтирования подписка снята", () => {
      const { unmount } = render(<Sphere />);
      unmount();
      requestFrame.mockClear();
      changeReducedMotion(true);
      changeReducedMotion(false);
      expect(requestFrame).not.toHaveBeenCalled();
    });
  });
});

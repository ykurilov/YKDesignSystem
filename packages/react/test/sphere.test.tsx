import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sphere } from "../src/index.js";
import { canvasContext, mockReducedMotion } from "./setup.js";

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
});

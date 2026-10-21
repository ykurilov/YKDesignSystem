import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../src/index.js";

let api: ReturnType<typeof useToast>;
function Probe() {
  api = useToast();
  return null;
}
function setup() {
  render(<ToastProvider><Probe /></ToastProvider>);
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe("Toast", () => {
  it("показывает сообщение в области role=status", () => {
    setup();
    act(() => { api.show({ message: "Проект удалён" }); });
    expect(screen.getByRole("status")).toHaveTextContent("Проект удалён");
  });

  it("кнопка действия вызывает onAction и убирает плашку", () => {
    setup();
    const onAction = vi.fn();
    act(() => { api.show({ message: "Проект удалён", actionLabel: "Вернуть", onAction }); });
    fireEvent.click(screen.getByRole("button", { name: "Вернуть" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Проект удалён")).toBeNull();
  });

  it("скрывается сама через заданное время", () => {
    setup();
    act(() => { api.show({ message: "Готово", duration: 4000 }); });
    act(() => { vi.advanceTimersByTime(3999); });
    expect(screen.getByText("Готово")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByText("Готово")).toBeNull();
  });

  it("по умолчанию живёт 5 секунд", () => {
    setup();
    act(() => { api.show({ message: "Готово" }); });
    act(() => { vi.advanceTimersByTime(4999); });
    expect(screen.getByText("Готово")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByText("Готово")).toBeNull();
  });

  it("пока курсор над плашкой, таймер стоит; после ухода доживает остаток", () => {
    setup();
    act(() => { api.show({ message: "Готово", duration: 4000 }); });
    act(() => { vi.advanceTimersByTime(3000); });
    fireEvent.mouseEnter(screen.getByRole("status"));
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(screen.getByText("Готово")).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByRole("status"));
    act(() => { vi.advanceTimersByTime(999); });
    expect(screen.getByText("Готово")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByText("Готово")).toBeNull();
  });

  it("фокус внутри плашки тоже ставит таймер на паузу", () => {
    setup();
    act(() => { api.show({ message: "Готово", actionLabel: "Вернуть", onAction: () => {}, duration: 1000 }); });
    fireEvent.focus(screen.getByRole("button", { name: "Вернуть" }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("Готово")).toBeInTheDocument();
  });

  it("duration: 0 — не скрывается сама", () => {
    setup();
    act(() => { api.show({ message: "Постоянное", duration: 0 }); });
    act(() => { vi.advanceTimersByTime(600_000); });
    expect(screen.getByText("Постоянное")).toBeInTheDocument();
  });

  it("dismiss(id) убирает плашку; несколько плашек живут независимо", () => {
    setup();
    let first = "";
    act(() => { first = api.show({ message: "Первая" }); });
    act(() => { api.show({ message: "Вторая" }); });
    expect(screen.getAllByRole("status")).toHaveLength(2);
    act(() => { api.dismiss(first); });
    expect(screen.queryByText("Первая")).toBeNull();
    expect(screen.getByText("Вторая")).toBeInTheDocument();
  });

  it("useToast вне провайдера — понятная ошибка", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ToastProvider/);
  });
});

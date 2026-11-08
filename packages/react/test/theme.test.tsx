import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeSettings, themeScript, useThemePreference } from "../src/index.js";

const html = document.documentElement;
afterEach(() => { localStorage.clear(); delete html.dataset.theme; });

describe("тема в настройках", () => {
  it("по умолчанию «Как в системе» и не задаёт тему странице", () => {
    render(<ThemeSettings />);
    expect(screen.getByRole("radiogroup", { name: "Тема" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Как в системе" })).toBeChecked();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(html.dataset.theme).toBeUndefined();
  });

  it("выбор применяется к странице и запоминается", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ThemeSettings />);
    await user.click(screen.getByRole("radio", { name: "Тёмная" }));
    expect(html.dataset.theme).toBe("dark");
    expect(localStorage.getItem("yk-theme")).toBe("dark");
    unmount();
    render(<ThemeSettings />);
    expect(screen.getByRole("radio", { name: "Тёмная" })).toBeChecked();
  });

  it("возврат к системной снимает тему со страницы и забывает выбор", async () => {
    const user = userEvent.setup();
    localStorage.setItem("yk-theme", "light");
    render(<ThemeSettings />);
    expect(html.dataset.theme).toBe("light");
    await user.click(screen.getByRole("radio", { name: "Как в системе" }));
    expect(html.dataset.theme).toBeUndefined();
    expect(localStorage.getItem("yk-theme")).toBeNull();
  });

  it("свой ключ хранения и общий выбор для всех частей приложения", async () => {
    const user = userEvent.setup();
    function Reader() { const { theme } = useThemePreference("my-theme"); return <output>{theme}</output>; }
    render(<><ThemeSettings storageKey="my-theme" /><Reader /></>);
    await user.click(screen.getByRole("radio", { name: "Светлая" }));
    expect(localStorage.getItem("my-theme")).toBe("light");
    expect(screen.getByRole("status")).toHaveTextContent("light");
  });

  it("испорченное значение в хранилище считается системной темой", () => {
    localStorage.setItem("yk-theme", "purple");
    render(<ThemeSettings />);
    expect(screen.getByRole("radio", { name: "Как в системе" })).toBeChecked();
  });

  it("скрипт для <head> применяет сохранённую тему до отрисовки", () => {
    localStorage.setItem("yk-theme", "dark");
    act(() => { new Function(themeScript())(); });
    expect(html.dataset.theme).toBe("dark");
    delete html.dataset.theme;
    localStorage.setItem("x", "bad");
    new Function(themeScript("x"))();
    expect(html.dataset.theme).toBeUndefined();
  });
});

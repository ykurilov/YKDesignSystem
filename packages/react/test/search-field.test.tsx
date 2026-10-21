import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SearchField } from "../src/index.js";

describe("SearchField", () => {
  it("поле поиска с лупой и подсказкой ⌘K", () => {
    render(<SearchField aria-label="Найти проект" />);
    const input = screen.getByRole("searchbox", { name: "Найти проект" });
    expect(input.parentElement!.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("⌘K").tagName).toBe("KBD");
  });

  it("подсказку клавиши можно убрать", () => {
    render(<SearchField aria-label="Поиск" kbd={null} />);
    expect(screen.queryByText("⌘K")).toBeNull();
  });

  it("пока поле пустое, кнопки очистки нет", () => {
    render(<SearchField aria-label="Поиск" />);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("с текстом появляется «Очистить», вместо подсказки клавиши", async () => {
    render(<SearchField aria-label="Поиск" />);
    await userEvent.type(screen.getByRole("searchbox"), "ма");
    expect(screen.getByRole("button", { name: "Очистить" })).toBeInTheDocument();
    expect(screen.queryByText("⌘K")).toBeNull();
  });

  it("очистка опустошает поле, возвращает фокус и сообщает onChange и onClear", async () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchField aria-label="Поиск" defaultValue="марафон" onChange={onChange} onClear={onClear} />);
    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("работает и под управлением снаружи", async () => {
    function Controlled() {
      const [value, setValue] = useState("курс");
      return <SearchField aria-label="Поиск" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("Escape очищает поле", async () => {
    render(<SearchField aria-label="Поиск" defaultValue="курс" />);
    await userEvent.click(screen.getByRole("searchbox"));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("Escape в пустом поле ничего не ломает", async () => {
    const onClear = vi.fn();
    render(<SearchField aria-label="Поиск" onClear={onClear} />);
    await userEvent.click(screen.getByRole("searchbox"));
    await userEvent.keyboard("{Escape}");
    expect(onClear).not.toHaveBeenCalled();
  });

  it("свое имя кнопки очистки", () => {
    render(<SearchField aria-label="Search" defaultValue="x" clearLabel="Clear" />);
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("кнопка очистки — обычная, type=button (форму не отправляет)", () => {
    render(<SearchField aria-label="Поиск" defaultValue="x" />);
    expect(screen.getByRole("button", { name: "Очистить" })).toHaveAttribute("type", "button");
  });
});

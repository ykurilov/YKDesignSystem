import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, Menu, type MenuEntry } from "../src/index.js";

function setup(extra: Partial<{ entries: MenuEntry[] }> = {}) {
  const onRename = vi.fn();
  const onDelete = vi.fn();
  const entries: MenuEntry[] = extra.entries ?? [
    { label: "Переименовать", icon: PencilSimpleIcon, shortcut: "R", onSelect: onRename },
    { label: "Дублировать", shortcut: "⌘D", onSelect: () => {} },
    "separator",
    { label: "Удалить", icon: TrashIcon, shortcut: "⌫", danger: true, onSelect: onDelete },
  ];
  render(
    <>
      <Menu label="Действия" trigger={<Button variant="secondary">Ещё</Button>} entries={entries} />
      <button>Снаружи</button>
    </>,
  );
  return { onRename, onDelete, trigger: screen.getByRole("button", { name: "Ещё" }) };
}

describe("Menu", () => {
  it("закрыто по умолчанию; у кнопки aria-haspopup и aria-expanded=false", () => {
    const { trigger } = setup();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("клик открывает меню с именем, первый пункт в фокусе", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Действия" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Переименовать/ })).toHaveFocus();
  });

  it("стрелка вниз на кнопке открывает меню", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("стрелки двигают фокус по кругу, Home и End — в начало и конец", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Дублировать/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Удалить/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Переименовать/ })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: /Удалить/ })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: /Переименовать/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: /Удалить/ })).toHaveFocus();
  });

  it("Enter выбирает пункт, закрывает меню и возвращает фокус на кнопку", async () => {
    const user = userEvent.setup();
    const { trigger, onRename } = setup();
    await user.click(trigger);
    await user.keyboard("{Enter}");
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("клик по пункту тоже выбирает", async () => {
    const user = userEvent.setup();
    const { trigger, onDelete } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: /Удалить/ }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Esc закрывает меню, фокус возвращается на кнопку", async () => {
    const user = userEvent.setup();
    const { trigger, onRename } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
    expect(onRename).not.toHaveBeenCalled();
  });

  it("клик снаружи закрывает меню", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByText("Снаружи"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("Tab закрывает меню", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    await user.tab();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("подсказки клавиш справа, разделитель, пункт-опасность", async () => {
    const user = userEvent.setup();
    const { trigger } = setup();
    await user.click(trigger);
    expect(screen.getByText("⌘D")).toHaveClass("yk-menu__kbd");
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Удалить/ })).toHaveClass("yk-menu__item--danger");
    expect(screen.getByRole("menuitem", { name: /Переименовать/ })).not.toHaveClass("yk-menu__item--danger");
  });

  it("отключённый пункт пропускается стрелками и не срабатывает", async () => {
    const user = userEvent.setup();
    const onSkipped = vi.fn();
    const { trigger } = setup({
      entries: [
        { label: "Первый", onSelect: () => {} },
        { label: "Недоступный", disabled: true, onSelect: onSkipped },
        { label: "Третий", onSelect: () => {} },
      ],
    });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Третий" })).toHaveFocus();
    await user.click(screen.getByRole("menuitem", { name: "Недоступный" }));
    expect(onSkipped).not.toHaveBeenCalled();
  });
});

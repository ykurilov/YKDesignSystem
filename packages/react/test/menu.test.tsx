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

  it("отключённый пункт достижим стрелками, озвучивается как недоступный и не срабатывает", async () => {
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
    const disabled = screen.getByRole("menuitem", { name: "Недоступный" });
    expect(disabled).toHaveFocus();
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    expect(onSkipped).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.click(disabled);
    expect(onSkipped).not.toHaveBeenCalled();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Третий" })).toHaveFocus();
  });

  describe("поиск по первой букве", () => {
    const entries = (): MenuEntry[] => [
      { label: "Переименовать", onSelect: () => {} },
      { label: "Дублировать", onSelect: () => {} },
      { label: "Делиться", onSelect: () => {} },
      { label: "Удалить", onSelect: () => {} },
    ];

    it("буква переводит фокус на пункт с такой первой буквой", async () => {
      const user = userEvent.setup();
      const { trigger } = setup({ entries: entries() });
      await user.click(trigger);
      await user.keyboard("у");
      expect(screen.getByRole("menuitem", { name: "Удалить" })).toHaveFocus();
    });

    it("регистр не важен, повторное нажатие идёт к следующему пункту и по кругу", async () => {
      const user = userEvent.setup();
      const { trigger } = setup({ entries: entries() });
      await user.click(trigger);
      await user.keyboard("Д");
      expect(screen.getByRole("menuitem", { name: "Дублировать" })).toHaveFocus();
      await user.keyboard("д");
      expect(screen.getByRole("menuitem", { name: "Делиться" })).toHaveFocus();
      await user.keyboard("д");
      expect(screen.getByRole("menuitem", { name: "Дублировать" })).toHaveFocus();
    });

    it("нет такой буквы — фокус остаётся, меню не закрывается", async () => {
      const user = userEvent.setup();
      const { trigger } = setup({ entries: entries() });
      await user.click(trigger);
      await user.keyboard("я");
      expect(screen.getByRole("menuitem", { name: "Переименовать" })).toHaveFocus();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("отключённый пункт тоже находится по букве", async () => {
      const user = userEvent.setup();
      const { trigger } = setup({ entries: [{ label: "Первый", onSelect: () => {} }, { label: "Блок", disabled: true, onSelect: () => {} }] });
      await user.click(trigger);
      await user.keyboard("б");
      expect(screen.getByRole("menuitem", { name: "Блок" })).toHaveFocus();
    });
  });
});

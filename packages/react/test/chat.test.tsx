import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, ChatHeader, ChatProgress, CompletionCard } from "../src/index.js";

describe("Шапка чата", () => {
  it("показывает название заголовком и необязательную начинку справа", () => {
    render(<ChatHeader title="Помощник магазина" aside={<span>Шаг 2 из 3</span>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Помощник магазина" })).toBeInTheDocument();
    expect(screen.getByText("Шаг 2 из 3")).toBeInTheDocument();
  });

  it("уровень заголовка задаёт приложение", () => {
    render(<ChatHeader title="Анкета" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Анкета" })).toBeInTheDocument();
  });

  it("отмечает прокрученную переписку, чтобы появилась тень", () => {
    const { container, rerender } = render(<ChatHeader title="Чат" />);
    const header = container.querySelector(".yk-chat-header")!;
    expect(header).not.toHaveClass("yk-chat-header--scrolled");
    rerender(<ChatHeader title="Чат" scrolled />);
    expect(header).toHaveClass("yk-chat-header--scrolled");
  });
});

describe("Индикатор хода", () => {
  it("сообщает диктору текущее значение и подпись", () => {
    render(<ChatProgress label="Шаг 2 из 3" value={2} max={3} />);
    const bar = screen.getByRole("progressbar", { name: "Шаг 2 из 3" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
    expect(bar).not.toHaveClass("yk-chat-progress--complete");
  });

  it("на максимуме становится завершённым, а лишнее значение обрезает", () => {
    render(<ChatProgress label="Готово" value={7} max={5} />);
    const bar = screen.getByRole("progressbar", { name: "Готово" });
    expect(bar).toHaveAttribute("aria-valuenow", "5");
    expect(bar).toHaveClass("yk-chat-progress--complete");
  });
});

describe("Карточка итога", () => {
  const items = [
    { id: "pay", label: "Оплата картой", status: "done" as const },
    { id: "card", label: "Открытка", status: "later" as const },
  ];

  it("показывает итог как именованный раздел со списком пунктов", () => {
    render(<CompletionCard title="Заказ оформлен" description="Курьер позвонит за час." items={items} note="Заказ 48 213" />);
    const card = screen.getByRole("region", { name: "Заказ оформлен" });
    expect(within(card).getByRole("heading", { name: "Заказ оформлен" })).toBeInTheDocument();
    expect(within(card).getByText("Курьер позвонит за час.")).toBeInTheDocument();
    expect(within(card).getAllByRole("listitem")).toHaveLength(2);
    expect(within(card).getByText("Заказ 48 213")).toBeInTheDocument();
  });

  it("подпись статуса задаёт приложение, сама карточка слов не дописывает", () => {
    render(<CompletionCard title="Готово" items={[...items, { id: "files", label: "Файлы", status: "later", statusLabel: "после звонка" }]} />);
    const [done, later, labelled] = screen.getAllByRole("listitem");
    expect(later).toHaveClass("yk-completion__item--later");
    expect(later.textContent).not.toContain("позже");
    expect(labelled.textContent).toContain("после звонка");
    expect(done.querySelector(".yk-visually-hidden")?.textContent).toContain("готово");
  });

  it("имена статусов для диктора можно перевести", () => {
    render(<CompletionCard title="Done" items={items} statusNames={{ done: "done", later: "postponed" }} />);
    const [done, later] = screen.getAllByRole("listitem");
    expect(done.textContent).toContain("done");
    expect(later.textContent).toContain("postponed");
  });

  it("действие — обычная кнопка приложения", async () => {
    const onClick = vi.fn();
    render(<CompletionCard title="Анкета заполнена" action={<Button onClick={onClick}>Дополнить ответы</Button>} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Дополнить ответы" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("без пунктов список не рисуется", () => {
    render(<CompletionCard title="Отчёт готов" />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});

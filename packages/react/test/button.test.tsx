import { ArrowUpIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src/index.js";

describe("Button", () => {
  it("по умолчанию — главная средняя кнопка type=button", () => {
    render(<Button>Создать</Button>);
    const button = screen.getByRole("button", { name: "Создать" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("yk-button", "yk-button--primary", "yk-button--md");
  });

  it.each(["primary", "secondary", "outline", "ghost", "danger", "link"] as const)("вид %s", (variant) => {
    render(<Button variant={variant}>Кнопка</Button>);
    expect(screen.getByRole("button")).toHaveClass(`yk-button--${variant}`);
  });

  it.each(["sm", "md", "lg"] as const)("размер %s", (size) => {
    render(<Button size={size}>Кнопка</Button>);
    expect(screen.getByRole("button")).toHaveClass(`yk-button--${size}`);
  });

  it("loading: aria-busy, недоступна, клик не доходит, видна сфера", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Агент пишет…</Button>);
    const button = screen.getByRole("button", { name: "Агент пишет…" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.querySelector("canvas")).not.toBeNull();
  });

  it("loading не отправляет форму", async () => {
    const onSubmit = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    render(<form onSubmit={onSubmit}><Button type="submit" loading>Отправить</Button></form>);
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disabled: клик не доходит", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Нельзя</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("обычный клик доходит", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Можно</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("только значок: имя из aria-label, квадратная форма", () => {
    render(<Button variant="secondary" icon={ArrowUpIcon} aria-label="Отправить" />);
    const button = screen.getByRole("button", { name: "Отправить" });
    expect(button).toHaveClass("yk-button--icon-only");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("только значок без aria-label — предупреждение в консоли", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error кнопке-значку обязателен aria-label
    render(<Button icon={ArrowUpIcon} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockRestore();
  });

  it("подсказка клавиши — элемент kbd", () => {
    render(<Button kbd="⌘N">Создать</Button>);
    expect(screen.getByText("⌘N").tagName).toBe("KBD");
  });

  it("значок перед текстом скрыт от экранного диктора", () => {
    render(<Button icon={ArrowUpIcon}>Наверх</Button>);
    expect(screen.getByRole("button", { name: "Наверх" }).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("передаёт ref на элемент button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Кнопка</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

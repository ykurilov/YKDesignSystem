import { ArrowUpIcon } from "@phosphor-icons/react";
import { fireEvent, render, screen } from "@testing-library/react";
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

describe("Button как ссылка (href)", () => {
  it("с href рендерится ссылкой a с тем же видом, без type", () => {
    render(<Button href="/docs" variant="link">Документация</Button>);
    const link = screen.getByRole("link", { name: "Документация" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).not.toHaveAttribute("type");
    expect(link).toHaveClass("yk-button", "yk-button--link", "yk-button--md");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("любой вид и размер работают и на ссылке", () => {
    render(<Button href="/x" variant="secondary" size="sm">Ссылка</Button>);
    expect(screen.getByRole("link")).toHaveClass("yk-button--secondary", "yk-button--sm");
  });

  it("значок, подсказка клавиши и только-значок работают на ссылке", () => {
    render(
      <>
        <Button href="/a" icon={ArrowUpIcon} kbd="G">Наверх</Button>
        <Button href="/b" icon={ArrowUpIcon} aria-label="Вверх" />
      </>,
    );
    expect(screen.getByRole("link", { name: /Наверх/ }).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Вверх" })).toHaveClass("yk-button--icon-only");
  });

  it("клик по ссылке доходит до onClick", async () => {
    const onClick = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    render(<Button href="/x" onClick={onClick}>Идём</Button>);
    await userEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("loading: aria-busy, клик отменяется, переход не происходит", async () => {
    const onClick = vi.fn();
    render(<Button href="/x" loading onClick={onClick}>Грузим</Button>);
    const link = screen.getByRole("link", { name: "Грузим" });
    expect(link).toHaveAttribute("aria-busy", "true");
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled: aria-disabled, нет в порядке табуляции, клик отменяется", async () => {
    const onClick = vi.fn();
    render(<Button href="/x" disabled onClick={onClick}>Нельзя</Button>);
    const link = screen.getByRole("link", { name: "Нельзя" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(link).not.toHaveAttribute("disabled");
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("внешняя ссылка: target и rel доходят до a", () => {
    render(<Button href="https://example.com" target="_blank" rel="noreferrer">Сайт</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noreferrer");
  });

  it("ref — на элемент a", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Button href="/x" ref={ref}>Ссылка</Button>);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("ссылка-значок без aria-label — предупреждение в консоли", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error ссылке-значку обязателен aria-label
    render(<Button href="/x" icon={ArrowUpIcon} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockRestore();
  });
});

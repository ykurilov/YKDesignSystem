import { EnvelopeIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "../src/index.js";

describe("TextField", () => {
  it("подпись связана с полем", () => {
    render(<TextField label="Название" />);
    const input = screen.getByLabelText("Название");
    expect(input.tagName).toBe("INPUT");
    expect(screen.getByText("Название")).toHaveClass("yk-mono-label");
  });

  it("подсказка описывает поле", () => {
    render(<TextField label="Название" hint="Видно участникам" />);
    expect(screen.getByLabelText("Название")).toHaveAccessibleDescription("Видно участникам");
    expect(screen.getByLabelText("Название")).not.toHaveAttribute("aria-invalid");
  });

  it("ошибка: aria-invalid и описание поля; подсказка остаётся в описании", () => {
    render(<TextField label="Почта" hint="Рабочая" error="Не хватает «.com»" />);
    const input = screen.getByLabelText("Почта");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Рабочая Не хватает «.com»");
    expect(screen.getByText("Не хватает «.com»")).toHaveClass("yk-field__hint--error");
  });

  it("значок слева скрыт от диктора, подсказка клавиши — элемент kbd", () => {
    render(<TextField label="Почта" icon={EnvelopeIcon} kbd="⌘M" />);
    const box = screen.getByLabelText("Почта").parentElement!;
    expect(box.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("⌘M").tagName).toBe("KBD");
  });

  it("клик по значку переводит фокус в поле", async () => {
    render(<TextField label="Почта" icon={EnvelopeIcon} />);
    const input = screen.getByLabelText("Почта");
    await userEvent.click(input.parentElement!.querySelector("svg")!);
    expect(input).toHaveFocus();
  });

  it("disabled", async () => {
    render(<TextField label="Только чтение" value="Текст" disabled readOnly />);
    const input = screen.getByLabelText("Только чтение");
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("yk-input--disabled");
  });

  it("ввод доходит до onChange, значение в поле", async () => {
    const onChange = vi.fn();
    render(<TextField label="Имя" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Имя"), "Юра");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByLabelText("Имя")).toHaveValue("Юра");
  });

  it("размеры sm и md", () => {
    const { rerender } = render(<TextField label="A" size="sm" />);
    expect(screen.getByLabelText("A").parentElement).toHaveClass("yk-input--sm");
    rerender(<TextField label="A" />);
    expect(screen.getByLabelText("A").parentElement).toHaveClass("yk-input--md");
  });

  it("id из пропса используется для связи подписи", () => {
    render(<TextField id="mail" label="Почта" hint="Подсказка" />);
    expect(screen.getByLabelText("Почта")).toHaveAttribute("id", "mail");
    expect(screen.getByLabelText("Почта")).toHaveAccessibleDescription("Подсказка");
  });

  it("пользовательский aria-describedby не теряется", () => {
    render(<><p id="extra">Доп.</p><TextField label="A" hint="Подсказка" aria-describedby="extra" /></>);
    expect(screen.getByLabelText("A")).toHaveAccessibleDescription("Доп. Подсказка");
  });

  it("без подписи и aria-label — предупреждение", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<TextField />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("YKDesignSystem"));
    warn.mockRestore();
  });

  it("aria-label заменяет подпись без предупреждения", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<TextField aria-label="Поиск" />);
    expect(screen.getByRole("textbox", { name: "Поиск" })).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("ref — на input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="A" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

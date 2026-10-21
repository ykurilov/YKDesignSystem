import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../src/index.js";

function Courses(props: Partial<Parameters<typeof Select>[0]>) {
  return (
    <Select label="Курс" {...props}>
      <option value="vibe">Вайб-кодинг</option>
      <option value="ai">ИИ для экспертов</option>
    </Select>
  );
}

describe("Select", () => {
  it("нативный select с подписью", () => {
    render(<Courses />);
    const select = screen.getByLabelText("Курс");
    expect(select.tagName).toBe("SELECT");
    expect(screen.getByRole("combobox", { name: "Курс" })).toBe(select);
  });

  it("выбор варианта доходит до onChange", async () => {
    const onChange = vi.fn();
    render(<Courses onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("Курс"), "ai");
    expect(screen.getByLabelText("Курс")).toHaveValue("ai");
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("значок caret-down скрыт от диктора", () => {
    render(<Courses />);
    const box = screen.getByLabelText("Курс").parentElement!;
    expect(box.querySelector(".yk-input__caret")).toHaveAttribute("aria-hidden", "true");
  });

  it("подсказка и ошибка", () => {
    render(<Courses hint="Один из двух" error="Выберите курс" />);
    const select = screen.getByLabelText("Курс");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Один из двух Выберите курс");
  });

  it("disabled и размер", () => {
    render(<Courses disabled size="sm" />);
    const select = screen.getByLabelText("Курс");
    expect(select).toBeDisabled();
    expect(select.parentElement).toHaveClass("yk-input--disabled", "yk-input--sm");
  });

  it("ref — на select", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Courses ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});

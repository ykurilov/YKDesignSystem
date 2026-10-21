import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../src/index.js";

describe("Checkbox", () => {
  it("флажок с подписью; клик по подписи переключает", async () => {
    render(<Checkbox>Напоминать</Checkbox>);
    const box = screen.getByRole("checkbox", { name: "Напоминать" });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText("Напоминать"));
    expect(box).toBeChecked();
  });

  it("пробел переключает", async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Напоминать</Checkbox>);
    await userEvent.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("под управлением снаружи", async () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return <Checkbox checked={on} onChange={(e) => setOn(e.target.checked)}>Только мои</Checkbox>;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("частично выбран: indeterminate виден диктору, после клика становится выбранным", async () => {
    render(<Checkbox indeterminate>Все задачи</Checkbox>);
    const box = screen.getByRole("checkbox");
    expect(box).toBePartiallyChecked();
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(box).not.toBePartiallyChecked();
  });

  it("indeterminate снимается, когда проп выключили", () => {
    const { rerender } = render(<Checkbox indeterminate>Все</Checkbox>);
    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    rerender(<Checkbox>Все</Checkbox>);
    expect(screen.getByRole("checkbox")).not.toBePartiallyChecked();
  });

  it("disabled: не переключается", async () => {
    render(<Checkbox disabled>Нельзя</Checkbox>);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("без текста нужен aria-label", () => {
    render(<Checkbox aria-label="Выбрать строку" />);
    expect(screen.getByRole("checkbox", { name: "Выбрать строку" })).toBeInTheDocument();
  });

  it("без текста и aria-label — предупреждение", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Checkbox />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));
    warn.mockRestore();
  });

  it("ref — на input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref}>A</Checkbox>);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

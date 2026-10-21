import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../src/index.js";

describe("Switch", () => {
  it("role=switch с aria-checked=false по умолчанию", () => {
    render(<Switch>Тёмная тема</Switch>);
    const toggle = screen.getByRole("switch", { name: "Тёмная тема" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle).toHaveAttribute("type", "button");
  });

  it("пробел переключает и зовёт onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>Письма</Switch>);
    await userEvent.tab();
    expect(screen.getByRole("switch")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("Enter тоже переключает", async () => {
    render(<Switch>Письма</Switch>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("клик по подписи переключает", async () => {
    render(<Switch>Письма</Switch>);
    await userEvent.click(screen.getByText("Письма"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("клик по самому переключателю меняет значение ровно один раз", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>Письма</Switch>);
    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledOnce();
  });

  it("defaultChecked — включён с самого начала", () => {
    render(<Switch defaultChecked>Письма</Switch>);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("под управлением снаружи", async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onCheckedChange={setOn}>Письма</Switch>;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("checked без обработчика не меняется сам", async () => {
    render(<Switch checked>Письма</Switch>);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("disabled: не переключается", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch disabled onCheckedChange={onCheckedChange}>Нельзя</Switch>);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("без текста нужен aria-label", () => {
    render(<Switch aria-label="Звук" />);
    expect(screen.getByRole("switch", { name: "Звук" })).toBeInTheDocument();
  });

  it("ref — на кнопку", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref}>A</Switch>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

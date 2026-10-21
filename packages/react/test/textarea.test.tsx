import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Textarea } from "../src/index.js";

describe("Textarea", () => {
  it("подпись, подсказка и ошибка связаны с полем", () => {
    render(<Textarea label="Задание" hint="Коротко" error="Пусто" />);
    const area = screen.getByLabelText("Задание");
    expect(area.tagName).toBe("TEXTAREA");
    expect(area).toHaveAttribute("aria-invalid", "true");
    expect(area).toHaveAccessibleDescription("Коротко Пусто");
  });

  it("по умолчанию три строки", () => {
    render(<Textarea label="Задание" />);
    expect(screen.getByLabelText("Задание")).toHaveAttribute("rows", "3");
  });

  it("ref — на textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="A" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  describe("autoGrow", () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
    afterEach(() => {
      if (original) Object.defineProperty(HTMLElement.prototype, "scrollHeight", original);
      else delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
    });

    it("высота подгоняется под содержимое при вводе и при первом показе", async () => {
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get() { return 20 * ((this as HTMLTextAreaElement).value.split("\n").length + 1); },
      });
      render(<Textarea label="Задание" autoGrow defaultValue={"а\nб"} />);
      const area = screen.getByLabelText("Задание");
      expect(area.style.height).toBe("60px");
      await userEvent.type(area, "{Enter}в");
      expect(area.style.height).toBe("80px");
    });

    it("без autoGrow высоту не трогает", async () => {
      render(<Textarea label="Задание" />);
      await userEvent.type(screen.getByLabelText("Задание"), "а");
      expect(screen.getByLabelText("Задание").style.height).toBe("");
    });
  });
});

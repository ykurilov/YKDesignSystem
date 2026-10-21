import { ArrowUpIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "../src/index.js";

describe("Icon", () => {
  it("по умолчанию 16px, обычное начертание и скрыт от экранного диктора", () => {
    const { container } = render(<Icon icon={ArrowUpIcon} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("yk-icon");
  });

  it("залитое начертание рисует другой контур", () => {
    const regular = render(<Icon icon={ArrowUpIcon} />).container.innerHTML;
    const fill = render(<Icon icon={ArrowUpIcon} weight="fill" />).container.innerHTML;
    expect(fill).not.toBe(regular);
  });

  it("с подписью становится картинкой с именем", () => {
    render(<Icon icon={ArrowUpIcon} size={20} label="Наверх" />);
    const img = screen.getByRole("img", { name: "Наверх" });
    expect(img).toHaveAttribute("width", "20");
    expect(img).not.toHaveAttribute("aria-hidden");
  });
});

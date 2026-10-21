import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../src/index.js";

const options = [
  { value: "all", label: "Все" },
  { value: "mine", label: "Мои" },
  { value: "archive", label: "Архив" },
];

describe("SegmentedControl", () => {
  it("группа выбора с именем; сегменты — radio с aria-checked", () => {
    render(<SegmentedControl aria-label="Показать" options={options} defaultValue="all" />);
    expect(screen.getByRole("radiogroup", { name: "Показать" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Все" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Мои" })).toHaveAttribute("aria-checked", "false");
  });

  it("без defaultValue выбран первый", () => {
    render(<SegmentedControl aria-label="Показать" options={options} />);
    expect(screen.getByRole("radio", { name: "Все" })).toHaveAttribute("aria-checked", "true");
  });

  it("клик выбирает и зовёт onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl aria-label="Показать" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Мои" }));
    expect(screen.getByRole("radio", { name: "Мои" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("mine");
  });

  it("под управлением снаружи значение само не меняется", async () => {
    render(<SegmentedControl aria-label="Показать" options={options} value="all" />);
    await userEvent.click(screen.getByRole("radio", { name: "Мои" }));
    expect(screen.getByRole("radio", { name: "Все" })).toHaveAttribute("aria-checked", "true");
  });

  it("в фокусе только выбранный сегмент (roving tabindex)", () => {
    render(<SegmentedControl aria-label="Показать" options={options} defaultValue="mine" />);
    expect(screen.getByRole("radio", { name: "Мои" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Все" })).toHaveAttribute("tabindex", "-1");
  });

  it("Tab входит в группу один раз и выходит из неё", async () => {
    render(<><SegmentedControl aria-label="Показать" options={options} /><button>после</button></>);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Все" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "после" })).toHaveFocus();
  });

  it("стрелки вправо/влево двигают фокус и выбор, по кругу", async () => {
    render(<SegmentedControl aria-label="Показать" options={options} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Мои" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Мои" })).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Все" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Архив" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Архив" })).toHaveAttribute("aria-checked", "true");
  });

  it("Home и End — первый и последний", async () => {
    render(<SegmentedControl aria-label="Показать" options={options} defaultValue="mine" />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Архив" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("radio", { name: "Все" })).toHaveFocus();
  });

  it("недоступный сегмент пропускается стрелками", async () => {
    const withDisabled = [options[0]!, { ...options[1]!, disabled: true }, options[2]!];
    render(<SegmentedControl aria-label="Показать" options={withDisabled} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Архив" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Мои" })).toBeDisabled();
  });

  it("sm и md", () => {
    const { rerender } = render(<SegmentedControl aria-label="П" options={options} size="sm" />);
    expect(screen.getByRole("radiogroup")).toHaveClass("yk-segmented--sm");
    rerender(<SegmentedControl aria-label="П" options={options} />);
    expect(screen.getByRole("radiogroup")).toHaveClass("yk-segmented--md");
  });

  it("disabled отключает все сегменты", () => {
    render(<SegmentedControl aria-label="П" options={options} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });
});

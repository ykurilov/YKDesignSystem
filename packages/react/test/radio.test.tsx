import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "../src/index.js";

function Frequency(props: Partial<Parameters<typeof RadioGroup>[0]>) {
  return (
    <RadioGroup label="Как часто" {...props}>
      <Radio value="day">Каждый день</Radio>
      <Radio value="week">Раз в неделю</Radio>
      <Radio value="month">Раз в месяц</Radio>
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("группа с именем из подписи, внутри радиокнопки", () => {
    render(<Frequency />);
    const group = screen.getByRole("radiogroup", { name: "Как часто" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("у всех радиокнопок общее имя поля", () => {
    render(<Frequency name="freq" />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAttribute("name", "freq");
  });

  it("без name даёт свой, общий для группы", () => {
    render(<Frequency />);
    const names = new Set(screen.getAllByRole("radio").map((r) => r.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("defaultValue выбирает начальную, клик меняет выбор и зовёт onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<Frequency defaultValue="day" onValueChange={onValueChange} />);
    expect(screen.getByRole("radio", { name: "Каждый день" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Раз в неделю" }));
    expect(screen.getByRole("radio", { name: "Раз в неделю" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Каждый день" })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("week");
  });

  it("под управлением снаружи значение не меняется само", async () => {
    render(<Frequency value="day" />);
    await userEvent.click(screen.getByRole("radio", { name: "Раз в неделю" }));
    expect(screen.getByRole("radio", { name: "Каждый день" })).toBeChecked();
  });

  it("стрелки клавиатуры переключают выбор по кругу", async () => {
    render(<Frequency defaultValue="day" />);
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Каждый день" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Раз в неделю" })).toBeChecked();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Каждый день" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("radio", { name: "Раз в месяц" })).toBeChecked();
  });

  it("disabled группы отключает все кнопки", () => {
    render(<Frequency disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("горизонтальная раскладка — модификатор", () => {
    render(<Frequency orientation="horizontal" />);
    expect(screen.getByRole("radiogroup")).toHaveClass("yk-radio-group--horizontal");
  });

  it("aria-label вместо видимой подписи", () => {
    render(<RadioGroup aria-label="Частота"><Radio value="a">А</Radio></RadioGroup>);
    expect(screen.getByRole("radiogroup", { name: "Частота" })).toBeInTheDocument();
  });
});

describe("Radio вне группы", () => {
  it("работает как обычная радиокнопка с name", async () => {
    render(<><Radio name="x" value="1">Раз</Radio><Radio name="x" value="2">Два</Radio></>);
    await userEvent.click(screen.getByRole("radio", { name: "Два" }));
    expect(screen.getByRole("radio", { name: "Два" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Раз" })).not.toBeChecked();
  });
});

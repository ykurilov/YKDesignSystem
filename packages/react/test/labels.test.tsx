import { CheckIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Avatar, Chip, MonoLabel, MonoNum, NewDot, Steps, Tag } from "../src/index.js";

describe("NewDot", () => {
  it("без подписи — декоративная", () => {
    const { container } = render(<NewDot />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("yk-new-dot");
  });
  it("с подписью — картинка с именем", () => {
    render(<NewDot label="Есть новое" />);
    expect(screen.getByRole("img", { name: "Есть новое" })).toBeInTheDocument();
  });
});

describe("MonoLabel и MonoNum", () => {
  it("используют классы моноширинного шрифта из переменных", () => {
    render(<><MonoLabel>Статусы</MonoLabel><MonoNum>3/5</MonoNum></>);
    expect(screen.getByText("Статусы")).toHaveClass("yk-mono-label");
    expect(screen.getByText("3/5")).toHaveClass("yk-mono-num");
  });
});

describe("Chip", () => {
  it("по умолчанию нейтральный", () => {
    render(<Chip>Черновик</Chip>);
    expect(screen.getByText("Черновик")).toHaveClass("yk-chip", "yk-chip--neutral");
  });
  it("live — со сферой", () => {
    render(<Chip tone="live">В работе</Chip>);
    const chip = screen.getByText("В работе");
    expect(chip).toHaveClass("yk-chip--live");
    expect(chip.querySelector("canvas")).not.toBeNull();
  });
  it.each(["success", "danger", "solid"] as const)("тон %s", (tone) => {
    render(<Chip tone={tone}>Метка</Chip>);
    expect(screen.getByText("Метка")).toHaveClass(`yk-chip--${tone}`);
  });
  it("значок слева", () => {
    render(<Chip tone="success" icon={CheckIcon}>Готово</Chip>);
    expect(screen.getByText("Готово").querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Tag", () => {
  it("кнопка удаления с понятным именем", async () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Вебинар</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "Удалить «Вебинар»" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
  it("без onRemove — без кнопки", () => {
    render(<Tag>Рассылка</Tag>);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("с onClick сам становится кнопкой", async () => {
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>тег</Tag>);
    await userEvent.click(screen.getByRole("button", { name: "тег" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("Steps", () => {
  it("индикатор прогресса с числами для экранного диктора", () => {
    render(<Steps total={5} done={3} label="План рассылки" />);
    const bar = screen.getByRole("progressbar", { name: "План рассылки" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar.querySelectorAll(".yk-steps__step")).toHaveLength(5);
    expect(bar.querySelectorAll(".yk-steps__step--done")).toHaveLength(3);
  });
  it("live — оранжевый", () => {
    render(<Steps total={5} done={2} tone="live" label="Шаги" />);
    expect(screen.getByRole("progressbar")).toHaveClass("yk-steps--live");
  });
  it("done не выходит за границы", () => {
    render(<Steps total={3} done={7} label="Шаги" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  });
});

describe("Avatar", () => {
  it("буквы и имя для экранного диктора", () => {
    render(<Avatar name="Юрий Курилов" initials="ЮК" />);
    const avatar = screen.getByRole("img", { name: "Юрий Курилов" });
    expect(avatar).toHaveTextContent("ЮК");
  });
  it("буквы по умолчанию берутся из имени", () => {
    render(<Avatar name="Мария Ким" />);
    expect(screen.getByRole("img", { name: "Мария Ким" })).toHaveTextContent("МК");
  });
  it("точка «новое» и имя дополняется", () => {
    render(<Avatar name="Мария Ким" hasNew />);
    const avatar = screen.getByRole("img", { name: "Мария Ким, есть новое" });
    expect(avatar.querySelector(".yk-new-dot")).not.toBeNull();
  });
  it("агент — со сферой вместо букв", () => {
    render(<Avatar name="Агент" agent />);
    const avatar = screen.getByRole("img", { name: "Агент" });
    expect(avatar).toHaveClass("yk-avatar--agent");
    expect(avatar.querySelector("canvas")).not.toBeNull();
  });
  it("маленький размер", () => {
    render(<Avatar name="Анна Иванова" size="sm" />);
    expect(screen.getByRole("img")).toHaveClass("yk-avatar--sm");
  });
});

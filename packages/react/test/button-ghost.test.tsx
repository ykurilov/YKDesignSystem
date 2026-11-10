import { ArrowLeftIcon, DotsThreeIcon, HeartIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button, type ButtonVariant } from "../src/index.js";

// Невидимая кнопка (ghost) — только значок без текста. Действие с текстом всегда видно как кнопка.
describe("Button ghost — только значок", () => {
  afterEach(() => vi.restoreAllMocks());

  it("значок без текста остаётся невидимой кнопкой, без предупреждений", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button variant="ghost" icon={DotsThreeIcon} aria-label="Ещё" />);
    expect(screen.getByRole("button", { name: "Ещё" })).toHaveClass("yk-button--ghost", "yk-button--icon-only");
    expect(warn).not.toHaveBeenCalled();
  });

  it("ghost с текстом рисуется второстепенной кнопкой и предупреждает", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error у невидимой кнопки не бывает текста
    render(<Button variant="ghost">Отмена</Button>);
    const button = screen.getByRole("button", { name: "Отмена" });
    expect(button).toHaveClass("yk-button--secondary");
    expect(button).not.toHaveClass("yk-button--ghost");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ghost"));
  });

  it("значок со счётчиком — это текст: второстепенная кнопка", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error счётчик — текст, ghost недопустим
    render(<Button variant="ghost" size="sm" icon={HeartIcon} aria-label="Нравится">{0}</Button>);
    expect(screen.getByRole("button", { name: "Нравится" })).toHaveClass("yk-button--secondary");
  });

  it("ссылка «назад» с текстом тоже не бывает невидимой", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // @ts-expect-error у невидимой кнопки не бывает текста
    render(<Button href="/feed" variant="ghost" icon={ArrowLeftIcon}>Лента</Button>);
    expect(screen.getByRole("link", { name: "Лента" })).toHaveClass("yk-button--secondary");
  });

  it("свой значок элементом без текста остаётся невидимым", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button variant="ghost" size="sm" aria-label="Приблизить"><svg aria-hidden="true" /></Button>);
    expect(screen.getByRole("button", { name: "Приблизить" })).toHaveClass("yk-button--ghost");
    expect(warn).not.toHaveBeenCalled();
  });

  it("текст, спрятанный во вложенный элемент, тоже ловится", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Button variant="ghost" aria-label="Чат"><span><svg aria-hidden="true" /><span>Чат</span></span></Button>);
    expect(screen.getByRole("button", { name: "Чат" })).toHaveClass("yk-button--secondary");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ghost"));
  });

  it("вид из переменной: с текстом ghost нельзя даже через общий тип", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const variant = "ghost" as ButtonVariant;
    // @ts-expect-error ButtonVariant включает ghost — для кнопки с текстом нужен TextButtonVariant
    render(<Button variant={variant}>Готово</Button>);
    expect(screen.getByRole("button", { name: "Готово" })).toHaveClass("yk-button--secondary");
  });
});
